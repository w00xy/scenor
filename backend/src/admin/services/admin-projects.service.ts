import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminProjectsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auditService: AdminAuditService,
  ) {}

  async getAllProjects(params: {
    limit?: number;
    offset?: number;
    search?: string;
    type?: string;
    isArchived?: boolean;
    ownerId?: string;
  }) {
    const { limit = 50, offset = 0, search, type, isArchived, ownerId } =
      params;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isArchived !== undefined) {
      where.isArchived = isArchived;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const [projects, total] = await Promise.all([
      this.db.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              workflows: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.project.count({ where }),
    ]);

    return { projects, total };
  }

  async getProjectById(projectId: string) {
    const project = await this.db.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        workflows: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            workflows: true,
            credentials: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async updateProject(
    projectId: string,
    data: {
      name?: string;
      description?: string;
      isArchived?: boolean;
    },
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const project = await this.db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updatedProject = await this.db.project.update({
      where: { id: projectId },
      data,
    });

    await this.auditService.logAction({
      adminId,
      action: 'PROJECT_UPDATE',
      targetType: 'PROJECT',
      targetId: projectId,
      details: { changes: data },
      ipAddress,
      userAgent,
    });

    return updatedProject;
  }

  async deleteProject(
    projectId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const project = await this.db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.db.project.delete({ where: { id: projectId } });

    await this.auditService.logAction({
      adminId,
      action: 'PROJECT_DELETE',
      targetType: 'PROJECT',
      targetId: projectId,
      details: { name: project.name, type: project.type },
      ipAddress,
      userAgent,
    });

    return { message: 'Project deleted successfully' };
  }

  async transferOwnership(
    projectId: string,
    newOwnerId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const project = await this.db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const newOwner = await this.db.user.findUnique({
      where: { id: newOwnerId },
    });

    if (!newOwner) {
      throw new NotFoundException('New owner not found');
    }

    const updatedProject = await this.db.project.update({
      where: { id: projectId },
      data: { ownerId: newOwnerId },
    });

    await this.auditService.logAction({
      adminId,
      action: 'PROJECT_TRANSFER_OWNERSHIP',
      targetType: 'PROJECT',
      targetId: projectId,
      details: {
        oldOwnerId: project.ownerId,
        newOwnerId,
      },
      ipAddress,
      userAgent,
    });

    return updatedProject;
  }

  async getProjectStatistics(projectId: string) {
    const project = await this.db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const [workflowsCount, executionsCount, credentialsCount, membersCount] =
      await Promise.all([
        this.db.workflow.count({ where: { projectId } }),
        this.db.workflowExecution.count({
          where: { workflow: { projectId } },
        }),
        this.db.credential.count({ where: { projectId } }),
        this.db.projectMember.count({ where: { projectId } }),
      ]);

    const executionsByStatus = await this.db.workflowExecution.groupBy({
      by: ['status'],
      where: { workflow: { projectId } },
      _count: true,
    });

    return {
      workflowsCount,
      executionsCount,
      credentialsCount,
      membersCount,
      executionsByStatus,
    };
  }
}
