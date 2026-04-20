import { Injectable } from '@nestjs/common';
import { Prisma, ProjectMemberRole, ProjectType, User } from '@prisma/client';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class UsersRepository {
  constructor(private prisma: DatabaseService) {}

  async findAll(limit: number, offset: number) {
    return this.prisma.user.findMany({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data: { username: string; email: string; password: string }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash: data.password,
        },
      });

      await this.createPersonalProjectForUser(tx, user);

      return user;
    });
  }

  private async createPersonalProjectForUser(
    tx: Prisma.TransactionClient,
    user: Pick<User, 'id'>,
  ) {
    const existingPersonalProject = await tx.project.findFirst({
      where: {
        ownerId: user.id,
        type: ProjectType.PERSONAL,
      },
      select: {
        id: true,
      },
    });

    const personalProject = existingPersonalProject
      ? existingPersonalProject
      : await tx.project.create({
          data: {
            ownerId: user.id,
            type: ProjectType.PERSONAL,
            name: 'Personal',
            description: 'Default personal project',
          },
          select: {
            id: true,
          },
        });

    await tx.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: personalProject.id,
          userId: user.id,
        },
      },
      create: {
        projectId: personalProject.id,
        userId: user.id,
        role: ProjectMemberRole.OWNER,
      },
      update: {
        role: ProjectMemberRole.OWNER,
      },
    });
  }

  async update(
    id: string,
    data: { username?: string; email?: string; password?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.password,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
