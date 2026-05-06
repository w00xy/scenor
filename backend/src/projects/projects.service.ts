import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectMemberRole, ProjectType } from '@prisma/client';
import { DatabaseService } from '../database/database.service.js';
import { CreateProjectDto, UpdateProjectDto } from './dto/index.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: DatabaseService) {}

  async createProject(userId: string, data: CreateProjectDto) {
    const name = data.name.trim();
    const description = data.description?.trim();

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          ownerId: userId,
          type: ProjectType.TEAM,
          name,
          description: description || null,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: ProjectMemberRole.OWNER,
        },
      });

      return project;
    });
  }

  async getMyProjects(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return projects.map((project) => {
      const accessRole =
        project.ownerId === userId
          ? ProjectMemberRole.OWNER
          : project.members[0]?.role;

      return {
        ...project,
        accessRole,
      };
    });
  }

  async getProjectById(userId: string, projectId: string) {
    const { project } = await this.requireProjectAccess(userId, projectId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
      ProjectMemberRole.VIEWER,
    ]);

    return project;
  }

  async updateProject(
    userId: string,
    projectId: string,
    data: UpdateProjectDto,
  ) {
    await this.requireProjectAccess(userId, projectId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    const updateData: {
      name?: string;
      description?: string | null;
      isArchived?: boolean;
    } = {};

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName) {
        throw new BadRequestException('Project name cannot be empty');
      }
      updateData.name = trimmedName;
    }

    if (data.description !== undefined) {
      const trimmedDescription = data.description.trim();
      updateData.description = trimmedDescription || null;
    }

    if (data.isArchived !== undefined) {
      updateData.isArchived = data.isArchived;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });
  }

  async deleteProject(userId: string, projectId: string) {
    await this.requireProjectAccess(userId, projectId, [
      ProjectMemberRole.OWNER,
    ]);

    return this.prisma.project.delete({
      where: { id: projectId },
    });
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
}
