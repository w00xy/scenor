import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { AuthModule } from '../auth/auth.module.js';

// Guards
import { AdminGuard } from './guards/admin.guard.js';

// Services
import { AdminAuditService } from './services/admin-audit.service.js';
import { AdminUsersService } from './services/admin-users.service.js';
import { AdminProjectsService } from './services/admin-projects.service.js';
import { AdminAnalyticsService } from './services/admin-analytics.service.js';

// Controllers
import { AdminUsersController } from './users/admin-users.controller.js';
import { AdminProjectsController } from './projects/admin-projects.controller.js';
import { AdminAnalyticsController } from './analytics/admin-analytics.controller.js';
import { AdminAuditController } from './audit/admin-audit.controller.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [
    AdminGuard,
    AdminAuditService,
    AdminUsersService,
    AdminProjectsService,
    AdminAnalyticsService,
  ],
  controllers: [
    AdminUsersController,
    AdminProjectsController,
    AdminAnalyticsController,
    AdminAuditController,
  ],
  exports: [AdminAuditService],
})
export class AdminModule {}
