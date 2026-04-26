import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { WorkflowSharesController } from './workflow-shares.controller.js';
import { WorkflowSharesService } from './workflow-shares.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [WorkflowSharesController],
  providers: [WorkflowSharesService],
  exports: [WorkflowSharesService],
})
export class WorkflowSharesModule {}
