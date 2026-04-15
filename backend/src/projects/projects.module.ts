import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenService } from '../auth/auth-token.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [ProjectsController],
  providers: [ProjectsService, AuthGuard, AuthTokenService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

