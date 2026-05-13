import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access for SUPER_ADMIN users', () => {
      const mockUser = { id: 'admin-123', role: 'SUPER_ADMIN' };
      const context = createMockExecutionContext(mockUser);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access for regular USER role', () => {
      const mockUser = { id: 'user-123', role: 'USER' };
      const context = createMockExecutionContext(mockUser);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. Only administrators can access this resource.',
      );
    });

    it('should deny access when user is not authenticated', () => {
      const context = createMockExecutionContext(null);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('User not authenticated');
    });

    it('should deny access when user is undefined', () => {
      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('User not authenticated');
    });

    it('should deny access when user has no role', () => {
      const mockUser = { id: 'user-123' };
      const context = createMockExecutionContext(mockUser);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. Only administrators can access this resource.',
      );
    });

    it('should deny access for invalid role', () => {
      const mockUser = { id: 'user-123', role: 'INVALID_ROLE' };
      const context = createMockExecutionContext(mockUser);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. Only administrators can access this resource.',
      );
    });

    it('should deny access for empty string role', () => {
      const mockUser = { id: 'user-123', role: '' };
      const context = createMockExecutionContext(mockUser);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. Only administrators can access this resource.',
      );
    });
  });
});
