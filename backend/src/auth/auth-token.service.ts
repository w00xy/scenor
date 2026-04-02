import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { SignOptions } from 'jsonwebtoken';

type TokenType = 'access' | 'refresh';

type JwtTokenPayload = {
  sub: string;
  role: Role;
  type: TokenType;
};

export type AuthTokenPayload = {
  sub: string;
  role: Role;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(userId: string, role: Role): Promise<AuthTokens> {
    const basePayload: Omit<JwtTokenPayload, 'type'> = {
      sub: userId,
      role,
    };
    const accessPayload: JwtTokenPayload = { ...basePayload, type: 'access' };
    const refreshPayload: JwtTokenPayload = { ...basePayload, type: 'refresh' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync<JwtTokenPayload>(accessPayload, {
        secret: this.getAccessSecret(),
        expiresIn: this.getAccessExpiresIn(),
      }),
      this.jwtService.signAsync<JwtTokenPayload>(refreshPayload, {
        secret: this.getRefreshSecret(),
        expiresIn: this.getRefreshExpiresIn(),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<AuthTokenPayload> {
    const payload = await this.verifyWithSecret(token, this.getAccessSecret());
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token type');
    }

    return { sub: payload.sub, role: payload.role };
  }

  async verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    const payload = await this.verifyWithSecret(token, this.getRefreshSecret());
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    return { sub: payload.sub, role: payload.role };
  }

  private async verifyWithSecret(token: string, secret: string) {
    try {
      return await this.jwtService.verifyAsync<JwtTokenPayload>(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private getAccessSecret() {
    const value = process.env.JWT_ACCESS_SECRET;
    if (!value) {
      throw new Error('JWT_ACCESS_SECRET is not set');
    }
    return value;
  }

  private getRefreshSecret() {
    const value = process.env.JWT_REFRESH_SECRET;
    if (!value) {
      throw new Error('JWT_REFRESH_SECRET is not set');
    }
    return value;
  }

  private getAccessExpiresIn(): SignOptions['expiresIn'] {
    return (process.env.JWT_ACCESS_EXPIRES_IN ??
      '15m') as SignOptions['expiresIn'];
  }

  private getRefreshExpiresIn(): SignOptions['expiresIn'] {
    return (process.env.JWT_REFRESH_EXPIRES_IN ??
      '7d') as SignOptions['expiresIn'];
  }
}
