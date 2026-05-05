import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { DatabaseService } from '../database/database.service.js';
import { UsersUtils } from '../users/users.utils.js';
import { NodeTypesService } from '../node-types/node-types.service.js';
import { EnvConfig } from '../config/env.config.js';

@Injectable()
export class InitializationService {
  private readonly logger = new Logger(InitializationService.name);

  constructor(
    private readonly prisma: DatabaseService,
    private readonly usersUtils: UsersUtils,
    private readonly nodeTypesService: NodeTypesService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async initialize() {
    this.logger.log('Starting application initialization...');

    try {
      await this.createAdminUser();
      await this.seedNodeTypes();
      this.logger.log('Application initialization completed successfully');
    } catch (error) {
      this.logger.error('Application initialization failed', error);
      throw error;
    }
  }

  private async createAdminUser() {
    const adminEmail = this.configService.get('ADMIN_EMAIL', { infer: true });
    const adminUsername = this.configService.get('ADMIN_USERNAME', { infer: true });
    const adminPassword = this.configService.get('ADMIN_PASSWORD', { infer: true });

    const existingAdmin = await this.prisma.user.findFirst({
      where: {
        OR: [
          { role: Role.SUPER_ADMIN },
          { username: adminUsername },
          { email: adminEmail },
        ],
      },
    });

    if (existingAdmin) {
      this.logger.log('Admin user already exists, skipping creation');
      return;
    }

    this.logger.log(`Creating admin user with email: ${adminEmail}`);

    const passwordHash = await this.usersUtils.hashPassword(adminPassword);

    const admin = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: adminUsername,
          email: adminEmail,
          passwordHash,
          role: Role.SUPER_ADMIN,
        },
      });

      await tx.userProfile.create({
        data: {
          userId: user.id,
        },
      });

      const personalProject = await tx.project.create({
        data: {
          ownerId: user.id,
          type: 'PERSONAL',
          name: 'Личный',
          description: 'Личный проект администратора',
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: personalProject.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      return user;
    });

    this.logger.log(`Admin user created successfully with ID: ${admin.id}`);
  }

  private async seedNodeTypes() {
    const existingNodeTypes = await this.prisma.nodeType.count();

    if (existingNodeTypes > 0) {
      this.logger.log('Node types already exist, skipping seeding');
      return;
    }

    this.logger.log('Seeding default node types...');

    const result = await this.nodeTypesService.seedDefaultNodeTypes();

    this.logger.log(`Successfully seeded ${result.count} node types`);
  }
}
