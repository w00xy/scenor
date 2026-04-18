import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenService } from '../auth/auth-token.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { WorkflowsController } from './workflows.controller.js';
import { WorkflowsService } from './workflows.service.js';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, AuthGuard, AuthTokenService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}

