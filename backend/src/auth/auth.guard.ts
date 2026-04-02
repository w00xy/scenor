import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthTokenPayload, AuthTokenService } from './auth-token.service.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authTokenService: AuthTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    request.user = await this.authTokenService.verifyAccessToken(token);
    return true;
  }
}
