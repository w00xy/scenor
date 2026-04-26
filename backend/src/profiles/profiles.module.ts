import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { ProfilesController } from './profiles.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [ProfilesService],
  controllers: [ProfilesController],
  exports: [ProfilesService],
})
export class ProfilesModule {}
