import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenService } from '../auth/auth-token.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { DatabaseModule } from '../database/database.module.js';
import { NodeTypesController } from './node-types.controller.js';
import { NodeTypesService } from './node-types.service.js';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [NodeTypesController],
  providers: [NodeTypesService, AuthTokenService, AuthGuard, RolesGuard],
  exports: [NodeTypesService],
})
export class NodeTypesModule {}

