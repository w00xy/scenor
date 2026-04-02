import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';
import { UsersController } from './users.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { UsersUtils } from './users.utils.js';
import { AuthTokenService } from '../auth/auth-token.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  providers: [
    UsersService,
    UsersRepository,
    UsersUtils,
    AuthTokenService,
    AuthGuard,
    RolesGuard,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
