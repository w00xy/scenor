import { Module } from '@nestjs/common';
import { InitializationService } from './initialization.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { UsersModule } from '../users/users.module.js';
import { NodeTypesModule } from '../node-types/node-types.module.js';

@Module({
  imports: [DatabaseModule, UsersModule, NodeTypesModule],
  providers: [InitializationService],
  exports: [InitializationService],
})
export class InitializationModule {}
