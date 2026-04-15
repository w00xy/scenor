import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenService } from '../auth/auth-token.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { ExecutionsController } from './executions.controller.js';
import { ExecutionsService } from './executions.service.js';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, AuthTokenService, AuthGuard],
  exports: [ExecutionsService],
})
export class ExecutionsModule {}

