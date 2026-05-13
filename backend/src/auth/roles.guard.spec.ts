import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard.js';
import { ROLES_KEY } from './roles.decorator.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (userRole?: Role): ExecutionContext => {
    const mockRequest = {
      user: userRole ? { sub: 'user-123', role: userRole } : undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const context = createMockExecutionContext(Role.USER);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
    });

    it('should allow access when roles array is empty', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);

      const context = createMockExecutionContext(Role.USER);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role (USER)', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);

      const context = createMockExecutionContext(Role.USER);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role (SUPER_ADMIN)', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.SUPER_ADMIN]);

      const context = createMockExecutionContext(Role.SUPER_ADMIN);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user role matches one of multiple required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.USER, Role.SUPER_ADMIN]);

      const context = createMockExecutionContext(Role.USER);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow SUPER_ADMIN access when multiple roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.USER, Role.SUPER_ADMIN]);

      const context = createMockExecutionContext(Role.SUPER_ADMIN);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.SUPER_ADMIN]);

      const context = createMockExecutionContext(Role.USER);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Insufficient permissions',
      );
    });

    it('should throw ForbiddenException when user role is undefined', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);

      const mockRequest = { user: { sub: 'user-123' } };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Insufficient permissions',
      );
    });

    it('should throw ForbiddenException when user object is missing', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);

      const mockRequest = {};
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Insufficient permissions',
      );
    });

    it('should throw ForbiddenException when USER tries to access SUPER_ADMIN-only route', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.SUPER_ADMIN]);

      const context = createMockExecutionContext(Role.USER);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Insufficient permissions',
      );
    });

    it('should throw ForbiddenException when role does not match any of multiple required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.SUPER_ADMIN]);

      const context = createMockExecutionContext(Role.USER);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should call reflector with correct parameters', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);

      const context = createMockExecutionContext(Role.USER);
      guard.canActivate(context);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledTimes(1);
    });

    it('should handle null required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);

      const context = createMockExecutionContext(Role.USER);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
