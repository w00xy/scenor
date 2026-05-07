import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';

// Guards
import { AdminGuard } from './guards/admin.guard';

// Services
import { AdminAuditService } from './services/admin-audit.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminProjectsService } from './services/admin-projects.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminWorkflowsService } from './services/admin-workflows.service';

// Controllers
import { AdminUsersController } from './users/admin-users.controller';
import { AdminProjectsController } from './projects/admin-projects.controller';
import { AdminAnalyticsController } from './analytics/admin-analytics.controller';
import { AdminAuditController } from './audit/admin-audit.controller';
import { AdminWorkflowsController } from './workflows/admin-workflows.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    AdminGuard,
    AdminAuditService,
    AdminUsersService,
    AdminProjectsService,
    AdminAnalyticsService,
    AdminWorkflowsService,
  ],
  controllers: [
    AdminUsersController,
    AdminProjectsController,
    AdminAnalyticsController,
    AdminAuditController,
    AdminWorkflowsController,
  ],
  exports: [AdminAuditService],
})
export class AdminModule {}
