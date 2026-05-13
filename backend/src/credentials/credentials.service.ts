import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, ProjectMemberRole } from '@prisma/client';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { DatabaseService } from '../database/database.service.js';
import { CreateCredentialDto, UpdateCredentialDto } from './dto/index.js';

@Injectable()
export class CredentialsService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    const key = this.configService.get<string>('CREDENTIALS_ENCRYPTION_KEY');

    if (!key) {
      throw new Error(
        'CREDENTIALS_ENCRYPTION_KEY is not set in environment variables',
      );
    }

    this.encryptionKey = Buffer.from(key, 'hex');
  }

  async createCredential(
    userId: string,
    projectId: string,
    data: CreateCredentialDto,
  ) {
    await this.requireProjectAccess(userId, projectId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    const encryptedData = this.encrypt(data.data);

    return this.prisma.credential.create({
      data: {
        projectId,
        type: data.type.trim(),
        name: data.name.trim(),
        encryptedData: encryptedData as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        projectId: true,
        type: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listCredentialsByProject(userId: string, projectId: string) {
    await this.requireProjectAccess(userId, projectId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
      ProjectMemberRole.VIEWER,
    ]);

    return this.prisma.credential.findMany({
      where: { projectId },
      select: {
        id: true,
        projectId: true,
        type: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCredentialById(userId: string, credentialId: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
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

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    const role =
      credential.project.ownerId === userId
        ? ProjectMemberRole.OWNER
        : credential.project.members[0]?.role;

    if (!role) {
      throw new ForbiddenException('Insufficient credential permissions');
    }

    return {
      id: credential.id,
      projectId: credential.projectId,
      type: credential.type,
      name: credential.name,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }

  async getCredentialWithData(userId: string, credentialId: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
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

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    const role =
      credential.project.ownerId === userId
        ? ProjectMemberRole.OWNER
        : credential.project.members[0]?.role;

    if (
      !role ||
      (role !== ProjectMemberRole.OWNER && role !== ProjectMemberRole.EDITOR)
    ) {
      throw new ForbiddenException('Insufficient credential permissions');
    }

    const decryptedData = this.decrypt(
      credential.encryptedData as Record<string, unknown>,
    );

    return {
      id: credential.id,
      projectId: credential.projectId,
      type: credential.type,
      name: credential.name,
      data: decryptedData,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }

  async updateCredential(
    userId: string,
    credentialId: string,
    data: UpdateCredentialDto,
  ) {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
      select: { projectId: true },
    });

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    await this.requireProjectAccess(userId, credential.projectId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    const updateData: Prisma.CredentialUncheckedUpdateInput = {};

    if (data.type !== undefined) {
      updateData.type = data.type.trim();
    }

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.data !== undefined) {
      updateData.encryptedData = this.encrypt(
        data.data,
      ) as Prisma.InputJsonValue;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    return this.prisma.credential.update({
      where: { id: credentialId },
      data: updateData,
      select: {
        id: true,
        projectId: true,
        type: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteCredential(userId: string, credentialId: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
      select: { projectId: true },
    });

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    await this.requireProjectAccess(userId, credential.projectId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    return this.prisma.credential.delete({
      where: { id: credentialId },
    });
  }

  private encrypt(data: Record<string, unknown>): Record<string, unknown> {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv);

    const plaintext = JSON.stringify(data);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex'),
    };
  }

  private decrypt(
    encryptedData: Record<string, unknown>,
  ): Record<string, unknown> {
    const iv = Buffer.from(String(encryptedData.iv), 'hex');
    const authTag = Buffer.from(String(encryptedData.authTag), 'hex');
    const encrypted = String(encryptedData.data);

    const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted) as Record<string, unknown>;
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
