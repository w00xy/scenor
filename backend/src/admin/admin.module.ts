import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';

// Guards
import { AdminGuard } from './guards/admin.guard';

// Services
import { AdminAuditService } from './services/admin-audit.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminProjectsService } from './services/admin-projects.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';

// Controllers
import { AdminUsersController } from './users/admin-users.controller';
import { AdminProjectsController } from './projects/admin-projects.controller';
import { AdminAnalyticsController } from './analytics/admin-analytics.controller';
import { AdminAuditController } from './audit/admin-audit.controller';

@Module({
  imports: [DatabaseModule],
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
