import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard.js';
import { AuthTokenService } from './auth-token.service.js';
import { RolesGuard } from './roles.guard.js';

@Module({
  imports: [JwtModule],
  providers: [AuthTokenService, AuthGuard, RolesGuard],
  exports: [AuthTokenService, AuthGuard, RolesGuard],
})
export class AuthModule {}
