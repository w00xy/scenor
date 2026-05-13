import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminWorkflowsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auditService: AdminAuditService,
  ) {}

  async getAllWorkflows(params: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
    projectId?: string;
    createdBy?: string;
  }) {
    const { limit = 50, offset = 0, search, status, projectId, createdBy } =
      params;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (createdBy) {
      where.createdBy = createdBy;
    }

    const [workflows, total] = await Promise.all([
      this.db.workflow.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              owner: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              nodes: true,
              edges: true,
              executions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.workflow.count({ where }),
    ]);

    return { workflows, total };
  }

  async getWorkflowById(workflowId: string) {
    const workflow = await this.db.workflow.findUnique({
      where: { id: workflowId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        nodes: {
          include: {
            nodeType: true,
          },
        },
        edges: true,
        _count: {
          select: {
            executions: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async deleteWorkflow(
    workflowId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const workflow = await this.db.workflow.findUnique({
      where: { id: workflowId },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    await this.db.workflow.delete({ where: { id: workflowId } });

    await this.auditService.logAction({
      adminId,
      action: 'WORKFLOW_DELETE',
      targetType: 'WORKFLOW',
      targetId: workflowId,
      details: {
        name: workflow.name,
        projectId: workflow.projectId,
        projectName: workflow.project.name,
      },
      ipAddress,
      userAgent,
    });

    return { message: 'Workflow deleted successfully' };
  }

  async getWorkflowStatistics(workflowId: string) {
    const workflow = await this.db.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const [nodesCount, edgesCount, executionsCount] = await Promise.all([
      this.db.workflowNode.count({ where: { workflowId } }),
      this.db.workflowEdge.count({ where: { workflowId } }),
      this.db.workflowExecution.count({ where: { workflowId } }),
    ]);

    const executionsByStatus = await this.db.workflowExecution.groupBy({
      by: ['status'],
      where: { workflowId },
      _count: true,
    });

    const lastExecution = await this.db.workflowExecution.findFirst({
      where: { workflowId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        status: true,
        startedAt: true,
        finishedAt: true,
      },
    });

    return {
      nodesCount,
      edgesCount,
      executionsCount,
      executionsByStatus,
      lastExecution,
    };
  }
}
