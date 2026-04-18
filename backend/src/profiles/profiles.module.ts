import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProfilesService } from './profiles.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { ProfilesController } from './profiles.controller.js';
import { AuthTokenService } from '../auth/auth-token.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  providers: [ProfilesService, AuthTokenService, AuthGuard],
  controllers: [ProfilesController],
  exports: [ProfilesService],
})
export class ProfilesModule {}
