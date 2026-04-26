import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { CredentialsController } from './credentials.controller.js';
import { CredentialsService } from './credentials.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
