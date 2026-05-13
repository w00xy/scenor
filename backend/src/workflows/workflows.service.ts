import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProjectMemberRole } from '@prisma/client';
import { randomBytes } from 'crypto';
import { DatabaseService } from '../database/database.service.js';
import {
  CreateWorkflowDto,
  CreateWorkflowEdgeDto,
  CreateWorkflowNodeDto,
  UpdateWorkflowDto,
  UpdateWorkflowEdgeDto,
  UpdateWorkflowNodeDto,
} from './dto/index.js';
import { validateNodeConfigByType } from './node-config.schemas.js';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: DatabaseService) {}

  async createWorkflow(
    userId: string,
    projectId: string,
    data: CreateWorkflowDto,
  ) {
    await this.requireProjectAccess(userId, projectId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    return this.prisma.workflow.create({
      data: {
        projectId,
        createdBy: userId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        status: data.status ?? 'draft',
        isPublic: data.isPublic ?? false,
      },
    });
  }

  async listWorkflowsByProject(userId: string, projectId: string) {
    await this.requireProjectAccess(userId, projectId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
      ProjectMemberRole.VIEWER,
    ]);

    return this.prisma.workflow.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getWorkflowById(userId: string, workflowId: string) {
    const { workflow } = await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
      ProjectMemberRole.VIEWER,
    ]);

    return workflow;
  }

  async updateWorkflow(
    userId: string,
    workflowId: string,
    data: UpdateWorkflowDto,
  ) {
    await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    const updateData: Prisma.WorkflowUncheckedUpdateInput = {};

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName) {
        throw new BadRequestException('Workflow name cannot be empty');
      }
      updateData.name = trimmedName;
    }

    if (data.description !== undefined) {
      const trimmedDescription = data.description.trim();
      updateData.description = trimmedDescription || null;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.version !== undefined) {
      updateData.version = data.version;
    }

    if (data.isPublic !== undefined) {
      updateData.isPublic = data.isPublic;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    return this.prisma.workflow.update({
      where: { id: workflowId },
      data: updateData,
    });
  }

  async deleteWorkflow(userId: string, workflowId: string) {
    await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    return this.prisma.workflow.delete({
      where: { id: workflowId },
    });
  }

  async getWorkflowGraph(userId: string, workflowId: string) {
    await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
      ProjectMemberRole.VIEWER,
    ]);

    const [nodes, edges] = await Promise.all([
      this.prisma.workflowNode.findMany({
        where: { workflowId },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.workflowEdge.findMany({
        where: { workflowId },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return { workflowId, nodes, edges };
  }

  async createNode(
    userId: string,
    workflowId: string,
    data: CreateWorkflowNodeDto,
  ) {
    const { workflow } = await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    const normalizedType = data.type.trim();
    const nodeType = await this.resolveNodeType(
      normalizedType,
      data.nodeTypeId,
    );
    await this.validateCredentialProjectScope(
      workflow.projectId,
      data.credentialsId,
    );

    let rawConfig =
      data.configJson ??
      (nodeType.defaultConfigJson as Record<string, unknown>) ??
      {};

    // Generate webhook token for webhook_trigger nodes
    if (normalizedType === 'webhook_trigger') {
      const token = this.generateWebhookToken();
      rawConfig = { ...rawConfig, token };
    }

    const validatedConfig = validateNodeConfigByType(normalizedType, rawConfig);

    const createdNode = await this.prisma.workflowNode.create({
      data: {
        workflowId,
        nodeTypeId: nodeType.id,
        typeCode: normalizedType,
        name: data.name?.trim() || null,
        label: data.label?.trim() || null,
        posX: data.posX,
        posY: data.posY,
        configJson: validatedConfig as Prisma.InputJsonValue,
        credentialsId: data.credentialsId ?? null,
        notes: data.notes?.trim() || null,
        isDisabled: data.isDisabled ?? false,
      },
    });

    // Обновляем updatedAt у workflow
    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: { updatedAt: new Date() },
    });

    return createdNode;
  }

  async updateNode(
    userId: string,
    workflowId: string,
    nodeId: string,
    data: UpdateWorkflowNodeDto,
  ) {
    const { workflow } = await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    const existingNode = await this.requireWorkflowNode(workflowId, nodeId);

    const updateData: Prisma.WorkflowNodeUncheckedUpdateInput = {};

    const nextType =
      data.type !== undefined ? data.type.trim() : existingNode.typeCode;
    if (!nextType) {
      throw new BadRequestException('Node type cannot be empty');
    }

    const nextNodeType = await this.resolveNodeType(nextType, data.nodeTypeId);
    updateData.nodeTypeId = nextNodeType.id;

    if (data.type !== undefined) {
      updateData.typeCode = nextType;
    }

    if (data.name !== undefined) {
      updateData.name = data.name.trim() || null;
    }

    if (data.label !== undefined) {
      updateData.label = data.label.trim() || null;
    }

    if (data.posX !== undefined) {
      updateData.posX = data.posX;
    }

    if (data.posY !== undefined) {
      updateData.posY = data.posY;
    }

    const nextConfigRaw =
      data.configJson ?? (existingNode.configJson as Record<string, unknown>);
    const validatedConfig = validateNodeConfigByType(nextType, nextConfigRaw);
    if (data.configJson !== undefined || data.type !== undefined) {
      updateData.configJson = validatedConfig as Prisma.InputJsonValue;
    }

    if (data.credentialsId !== undefined) {
      await this.validateCredentialProjectScope(
        workflow.projectId,
        data.credentialsId,
      );
      updateData.credentialsId = data.credentialsId;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes.trim() || null;
    }

    if (data.isDisabled !== undefined) {
      updateData.isDisabled = data.isDisabled;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const updatedNode = await this.prisma.workflowNode.update({
      where: { id: nodeId },
      data: updateData,
    });

    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: { updatedAt: new Date() },
    });

    return updatedNode;
  }

  async deleteNode(userId: string, workflowId: string, nodeId: string) {
    await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);
    await this.requireWorkflowNode(workflowId, nodeId);

    const deletedNode = await this.prisma.workflowNode.delete({
      where: { id: nodeId },
    });

    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: { updatedAt: new Date() },
    });

    return deletedNode;
  }

  async createEdge(
    userId: string,
    workflowId: string,
    data: CreateWorkflowEdgeDto,
  ) {
    await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    await Promise.all([
      this.requireWorkflowNode(workflowId, data.sourceNodeId),
      this.requireWorkflowNode(workflowId, data.targetNodeId),
    ]);

    const createdEdge = await this.prisma.workflowEdge.create({
      data: {
        workflowId,
        sourceNodeId: data.sourceNodeId,
        targetNodeId: data.targetNodeId,
        sourceHandle: data.sourceHandle?.trim() || null,
        targetHandle: data.targetHandle?.trim() || null,
        conditionType: data.conditionType?.trim() || null,
        label: data.label?.trim() || null,
      },
    });

    // Обновляем updatedAt у workflow
    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: { updatedAt: new Date() },
    });

    return createdEdge;
  }

  async updateEdge(
    userId: string,
    workflowId: string,
    edgeId: string,
    data: UpdateWorkflowEdgeDto,
  ) {
    await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    await this.requireWorkflowEdge(workflowId, edgeId);

    if (data.sourceNodeId) {
      await this.requireWorkflowNode(workflowId, data.sourceNodeId);
    }
    if (data.targetNodeId) {
      await this.requireWorkflowNode(workflowId, data.targetNodeId);
    }

    const updateData: Prisma.WorkflowEdgeUncheckedUpdateInput = {};

    if (data.sourceNodeId !== undefined) {
      updateData.sourceNodeId = data.sourceNodeId;
    }
    if (data.targetNodeId !== undefined) {
      updateData.targetNodeId = data.targetNodeId;
    }
    if (data.sourceHandle !== undefined) {
      updateData.sourceHandle = data.sourceHandle.trim() || null;
    }
    if (data.targetHandle !== undefined) {
      updateData.targetHandle = data.targetHandle.trim() || null;
    }
    if (data.conditionType !== undefined) {
      updateData.conditionType = data.conditionType.trim() || null;
    }
    if (data.label !== undefined) {
      updateData.label = data.label.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const updatedEdge = await this.prisma.workflowEdge.update({
      where: { id: edgeId },
      data: updateData,
    });

    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: { updatedAt: new Date() },
    });

    return updatedEdge;
  }

  async deleteEdge(userId: string, workflowId: string, edgeId: string) {
    await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);
    await this.requireWorkflowEdge(workflowId, edgeId);

    const deletedEdge = await this.prisma.workflowEdge.delete({
      where: { id: edgeId },
    });

    // Обновляем updatedAt у workflow
    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: { updatedAt: new Date() },
    });

    return deletedEdge;
  }

  private generateWebhookToken(): string {
    return randomBytes(32).toString('hex');
  }

  private async resolveNodeType(type: string, nodeTypeId?: string) {
    if (nodeTypeId) {
      const nodeType = await this.prisma.nodeType.findUnique({
        where: { id: nodeTypeId },
        select: {
          id: true,
          code: true,
          isActive: true,
          defaultConfigJson: true,
        },
      });
      if (!nodeType) {
        throw new NotFoundException('Node type not found');
      }
      if (!nodeType.isActive) {
        throw new BadRequestException('Node type is inactive');
      }
      if (nodeType.code !== type) {
        throw new BadRequestException(
          `Node type code mismatch: expected "${nodeType.code}"`,
        );
      }
      return nodeType;
    }

    const nodeType = await this.prisma.nodeType.findUnique({
      where: { code: type },
      select: { id: true, code: true, isActive: true, defaultConfigJson: true },
    });
    if (!nodeType || !nodeType.isActive) {
      throw new BadRequestException(`Unsupported node type "${type}"`);
    }
    return nodeType;
  }

  private async validateCredentialProjectScope(
    projectId: string,
    credentialsId?: string,
  ) {
    if (!credentialsId) {
      return;
    }

    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialsId },
      select: { id: true, projectId: true },
    });
    if (!credential) {
      throw new NotFoundException('Credential not found');
    }
    if (credential.projectId !== projectId) {
      throw new ForbiddenException('Credential belongs to another project');
    }
  }

  private async requireWorkflowNode(workflowId: string, nodeId: string) {
    const node = await this.prisma.workflowNode.findFirst({
      where: { id: nodeId, workflowId },
      select: {
        id: true,
        typeCode: true,
        configJson: true,
      },
    });

    if (!node) {
      throw new NotFoundException('Workflow node not found');
    }

    return node;
  }

  private async requireWorkflowEdge(workflowId: string, edgeId: string) {
    const edge = await this.prisma.workflowEdge.findFirst({
      where: { id: edgeId, workflowId },
      select: { id: true },
    });

    if (!edge) {
      throw new NotFoundException('Workflow edge not found');
    }

    return edge;
  }

  private async requireProjectAccess(
    userId: string,
    projectId: string,
    allowedRoles: ProjectMemberRole[],
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId },
          select: { role: true },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const role =
      project.ownerId === userId
        ? ProjectMemberRole.OWNER
        : project.members[0]?.role;

    if (!role || !allowedRoles.includes(role)) {
      throw new ForbiddenException('Insufficient project permissions');
    }

    return { project, role };
  }

  private async requireWorkflowAccess(
    userId: string,
    workflowId: string,
    allowedRoles: ProjectMemberRole[],
  ) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
              select: { role: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const role =
      workflow.project.ownerId === userId
        ? ProjectMemberRole.OWNER
        : workflow.project.members[0]?.role;

    if (!role || !allowedRoles.includes(role)) {
      throw new ForbiddenException('Insufficient workflow permissions');
    }

    return { workflow, role };
  }
}
