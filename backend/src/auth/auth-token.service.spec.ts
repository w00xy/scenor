import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthTokenService } from './auth-token.service.js';

describe('AuthTokenService', () => {
  let service: AuthTokenService;
  let jwtService: JwtService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthTokenService>(AuthTokenService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const userId = 'user-123';
      const role = Role.USER;
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      mockJwtService.signAsync
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);

      const result = await service.generateTokens(userId, role);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: userId, role, type: 'access' },
        { secret: 'test-access-secret', expiresIn: '15m' },
      );
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: userId, role, type: 'refresh' },
        { secret: 'test-refresh-secret', expiresIn: '7d' },
      );
    });

    it('should generate tokens for SUPER_ADMIN role', async () => {
      const userId = 'admin-456';
      const role = Role.SUPER_ADMIN;
      const mockAccessToken = 'admin-access-token';
      const mockRefreshToken = 'admin-refresh-token';

      mockJwtService.signAsync
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);

      const result = await service.generateTokens(userId, role);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.SUPER_ADMIN }),
        expect.any(Object),
      );
    });

    it('should throw error when JWT_ACCESS_SECRET is not set', async () => {
      delete process.env.JWT_ACCESS_SECRET;

      await expect(
        service.generateTokens('user-123', Role.USER),
      ).rejects.toThrow('JWT_ACCESS_SECRET is not set');
    });

    it('should throw error when JWT_REFRESH_SECRET is not set', async () => {
      delete process.env.JWT_REFRESH_SECRET;
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');

      await expect(
        service.generateTokens('user-123', Role.USER),
      ).rejects.toThrow('JWT_REFRESH_SECRET is not set');
    });

    it('should use default expiration times when not set in env', async () => {
      delete process.env.JWT_ACCESS_EXPIRES_IN;
      delete process.env.JWT_REFRESH_EXPIRES_IN;

      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.generateTokens('user-123', Role.USER);

      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        expect.any(Object),
        expect.objectContaining({ expiresIn: '15m' }),
      );
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        expect.any(Object),
        expect.objectContaining({ expiresIn: '7d' }),
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', async () => {
      const token = 'valid-access-token';
      const mockPayload = {
        sub: 'user-123',
        role: Role.USER,
        type: 'access' as const,
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await service.verifyAccessToken(token);

      expect(result).toEqual({
        sub: 'user-123',
        role: Role.USER,
      });

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test-access-secret',
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const token = 'invalid-token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyAccessToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyAccessToken(token)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const token = 'expired-token';

      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Token expired'),
      );

      await expect(service.verifyAccessToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token type is not access', async () => {
      const token = 'refresh-token-used-as-access';
      const mockPayload = {
        sub: 'user-123',
        role: Role.USER,
        type: 'refresh' as const,
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      await expect(service.verifyAccessToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyAccessToken(token)).rejects.toThrow(
        'Invalid access token type',
      );
    });

    it('should verify access token with SUPER_ADMIN role', async () => {
      const token = 'admin-access-token';
      const mockPayload = {
        sub: 'admin-456',
        role: Role.SUPER_ADMIN,
        type: 'access' as const,
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await service.verifyAccessToken(token);

      expect(result).toEqual({
        sub: 'admin-456',
        role: Role.SUPER_ADMIN,
      });
    });

    it('should throw error when JWT_ACCESS_SECRET is not set', async () => {
      delete process.env.JWT_ACCESS_SECRET;

      await expect(service.verifyAccessToken('token')).rejects.toThrow(
        'JWT_ACCESS_SECRET is not set',
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      const token = 'valid-refresh-token';
      const mockPayload = {
        sub: 'user-123',
        role: Role.USER,
        type: 'refresh' as const,
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await service.verifyRefreshToken(token);

      expect(result).toEqual({
        sub: 'user-123',
        role: Role.USER,
      });

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test-refresh-secret',
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const token = 'invalid-token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyRefreshToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyRefreshToken(token)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw UnauthorizedException when token type is not refresh', async () => {
      const token = 'access-token-used-as-refresh';
      const mockPayload = {
        sub: 'user-123',
        role: Role.USER,
        type: 'access' as const,
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      await expect(service.verifyRefreshToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyRefreshToken(token)).rejects.toThrow(
        'Invalid refresh token type',
      );
    });

    it('should verify refresh token with SUPER_ADMIN role', async () => {
      const token = 'admin-refresh-token';
      const mockPayload = {
        sub: 'admin-456',
        role: Role.SUPER_ADMIN,
        type: 'refresh' as const,
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await service.verifyRefreshToken(token);

      expect(result).toEqual({
        sub: 'admin-456',
        role: Role.SUPER_ADMIN,
      });
    });

    it('should throw error when JWT_REFRESH_SECRET is not set', async () => {
      delete process.env.JWT_REFRESH_SECRET;

      await expect(service.verifyRefreshToken('token')).rejects.toThrow(
        'JWT_REFRESH_SECRET is not set',
      );
    });
  });
});
