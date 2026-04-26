import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { NodeTypesController } from './node-types.controller.js';
import { NodeTypesService } from './node-types.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [NodeTypesController],
  providers: [NodeTypesService],
  exports: [NodeTypesService],
})
export class NodeTypesModule {}

