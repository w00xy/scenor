import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { ExecutionsController } from './executions.controller.js';
import { ExecutionsService } from './executions.service.js';
import { ExecutionGateway } from './gateways/execution.gateway.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, ExecutionGateway],
  exports: [ExecutionsService, ExecutionGateway],
})
export class ExecutionsModule {}

