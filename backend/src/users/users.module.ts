import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';
import { UsersController } from './users.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { UsersUtils } from './users.utils.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [UsersService, UsersRepository, UsersUtils],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
