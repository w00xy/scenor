import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { DatabaseModule } from '../database/database.module';
import { ProfilesController } from './profiles.controller';
import { AuthTokenService } from '../auth/auth-token.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule],
  providers: [
    ProfilesService,
    AuthTokenService,
    JwtService,
  ],
  controllers: [ProfilesController],
  exports: [ProfilesService],
})
export class ProfilesModule {}
