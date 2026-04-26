import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectMemberRole, ShareAccessType } from '@prisma/client';
import { randomBytes } from 'crypto';
import { DatabaseService } from '../database/database.service.js';
import { CreateWorkflowShareDto } from './dto/index.js';

@Injectable()
export class WorkflowSharesService {
  constructor(private readonly prisma: DatabaseService) {}

  async createWorkflowShare(
    userId: string,
    workflowId: string,
    data: CreateWorkflowShareDto,
  ) {
    await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    const token = this.generateToken();
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    if (expiresAt && expiresAt <= new Date()) {
      throw new BadRequestException('Expiration date must be in the future');
    }

    return this.prisma.workflowShare.create({
      data: {
        workflowId,
        token,
        accessType: data.accessType ?? ShareAccessType.view,
        expiresAt,
        createdBy: userId,
      },
    });
  }

  async listWorkflowShares(userId: string, workflowId: string) {
    await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
      ProjectMemberRole.VIEWER,
    ]);

    return this.prisma.workflowShare.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkflowByToken(token: string) {
    const share = await this.prisma.workflowShare.findUnique({
      where: { token },
      include: {
        workflow: {
          include: {
            nodes: true,
            edges: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.expiresAt && share.expiresAt <= new Date()) {
      throw new BadRequestException('Share has expired');
    }

    return {
      accessType: share.accessType,
      workflow: {
        id: share.workflow.id,
        name: share.workflow.name,
        description: share.workflow.description,
        status: share.workflow.status,
        version: share.workflow.version,
        createdAt: share.workflow.createdAt,
        updatedAt: share.workflow.updatedAt,
        project: share.workflow.project,
        nodes: share.workflow.nodes,
        edges: share.workflow.edges,
      },
    };
  }

  async deleteWorkflowShare(userId: string, shareId: string) {
    const share = await this.prisma.workflowShare.findUnique({
      where: { id: shareId },
      include: {
        workflow: {
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
        },
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    const role =
      share.workflow.project.ownerId === userId
        ? ProjectMemberRole.OWNER
        : share.workflow.project.members[0]?.role;

    if (
      !role ||
      (role !== ProjectMemberRole.OWNER && role !== ProjectMemberRole.EDITOR)
    ) {
      throw new ForbiddenException('Insufficient permissions to delete share');
    }

    return this.prisma.workflowShare.delete({
      where: { id: shareId },
    });
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
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
