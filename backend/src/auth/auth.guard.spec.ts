import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from './auth.guard.js';
import { AuthTokenService, AuthTokenPayload } from './auth-token.service.js';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authTokenService: AuthTokenService;

  const mockAuthTokenService = {
    verifyAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthTokenService,
          useValue: mockAuthTokenService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    authTokenService = module.get<AuthTokenService>(AuthTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (
    authorizationHeader?: string,
  ): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authorizationHeader,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow access with valid Bearer token', async () => {
      const token = 'valid-token';
      const mockPayload: AuthTokenPayload = {
        sub: 'user-123',
        role: Role.USER,
      };

      mockAuthTokenService.verifyAccessToken.mockResolvedValue(mockPayload);

      const context = createMockExecutionContext(`Bearer ${token}`);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockAuthTokenService.verifyAccessToken).toHaveBeenCalledWith(
        token,
      );

      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual(mockPayload);
    });

    it('should allow access with valid Bearer token for SUPER_ADMIN', async () => {
      const token = 'admin-token';
      const mockPayload: AuthTokenPayload = {
        sub: 'admin-456',
        role: Role.SUPER_ADMIN,
      };

      mockAuthTokenService.verifyAccessToken.mockResolvedValue(mockPayload);

      const context = createMockExecutionContext(`Bearer ${token}`);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockAuthTokenService.verifyAccessToken).toHaveBeenCalledWith(
        token,
      );

      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Missing or invalid authorization header',
      );

      expect(mockAuthTokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header does not start with Bearer', async () => {
      const context = createMockExecutionContext('Basic token123');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Missing or invalid authorization header',
      );

      expect(mockAuthTokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is empty after Bearer', async () => {
      const context = createMockExecutionContext('Bearer ');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Token is required',
      );

      expect(mockAuthTokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is only whitespace', async () => {
      const context = createMockExecutionContext('Bearer    ');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Token is required',
      );

      expect(mockAuthTokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should handle token with extra whitespace correctly', async () => {
      const token = 'valid-token-with-spaces';
      const mockPayload: AuthTokenPayload = {
        sub: 'user-789',
        role: Role.USER,
      };

      mockAuthTokenService.verifyAccessToken.mockResolvedValue(mockPayload);

      const context = createMockExecutionContext(`Bearer   ${token}   `);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockAuthTokenService.verifyAccessToken).toHaveBeenCalledWith(
        token,
      );
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      const token = 'invalid-token';

      mockAuthTokenService.verifyAccessToken.mockRejectedValue(
        new UnauthorizedException('Invalid or expired token'),
      );

      const context = createMockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid or expired token',
      );

      expect(mockAuthTokenService.verifyAccessToken).toHaveBeenCalledWith(
        token,
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const token = 'expired-token';

      mockAuthTokenService.verifyAccessToken.mockRejectedValue(
        new UnauthorizedException('Invalid or expired token'),
      );

      const context = createMockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockAuthTokenService.verifyAccessToken).toHaveBeenCalledWith(
        token,
      );
    });

    it('should handle malformed Bearer header', async () => {
      const context = createMockExecutionContext('Bearertoken123');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Missing or invalid authorization header',
      );
    });

    it('should handle case-sensitive Bearer keyword', async () => {
      const context = createMockExecutionContext('bearer token123');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Missing or invalid authorization header',
      );
    });

    it('should handle authorization header with multiple spaces', async () => {
      const token = 'multi-space-token';
      const mockPayload: AuthTokenPayload = {
        sub: 'user-999',
        role: Role.USER,
      };

      mockAuthTokenService.verifyAccessToken.mockResolvedValue(mockPayload);

      const context = createMockExecutionContext(`Bearer     ${token}`);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockAuthTokenService.verifyAccessToken).toHaveBeenCalledWith(
        token,
      );
    });
  });
});
