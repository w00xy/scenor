import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from '../services/admin-users.service';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../../auth/auth.guard.js';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let service: jest.Mocked<AdminUsersService>;

  const mockAdminUsersService = {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    blockUser: jest.fn(),
    unblockUser: jest.fn(),
    deleteUser: jest.fn(),
    resetPassword: jest.fn(),
    getUserActivity: jest.fn(),
  };

  const mockRequest = {
    user: { sub: 'admin-id-123', role: 'SUPER_ADMIN' },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: AdminUsersService,
          useValue: mockAdminUsersService,
        },
        {
          provide: AdminGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
    service = module.get(AdminUsersService) as jest.Mocked<AdminUsersService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return paginated users list', async () => {
      const query = { limit: 10, offset: 0 };
      const mockResult = {
        users: [
          {
            id: 'user-1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'USER' as const,
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: null,
            _count: {
              projects: 0,
              createdWorkflows: 0,
              startedExecutions: 0,
            },
          },
        ],
        total: 1,
      };

      service.getAllUsers.mockResolvedValue(mockResult);

      const result = await controller.getAllUsers(query);

      expect(service.getAllUsers).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should filter users by search term', async () => {
      const query = { search: 'john', limit: 50, offset: 0 };
      const mockResult = { users: [], total: 0 };

      service.getAllUsers.mockResolvedValue(mockResult);

      await controller.getAllUsers(query);

      expect(service.getAllUsers).toHaveBeenCalledWith(query);
    });

    it('should filter users by role', async () => {
      const query = { role: 'SUPER_ADMIN', limit: 50, offset: 0 };
      const mockResult = { users: [], total: 0 };

      service.getAllUsers.mockResolvedValue(mockResult);

      await controller.getAllUsers(query);

      expect(service.getAllUsers).toHaveBeenCalledWith(query);
    });

    it('should filter users by blocked status', async () => {
      const query = { isBlocked: true, limit: 50, offset: 0 };
      const mockResult = { users: [], total: 0 };

      service.getAllUsers.mockResolvedValue(mockResult);

      await controller.getAllUsers(query);

      expect(service.getAllUsers).toHaveBeenCalledWith(query);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER' as const,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: null,
        _count: {
          projects: 0,
          memberships: 0,
          createdWorkflows: 0,
          startedExecutions: 0,
        },
      };

      service.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(userId);

      expect(service.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const userId = 'user-123';
      const updateDto = { username: 'newusername', email: 'new@example.com' };
      const mockUpdatedUser = {
        id: userId,
        username: 'newusername',
        email: 'new@example.com',
        role: 'USER' as const,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.updateUser.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateUser(userId, updateDto, mockRequest);

      expect(service.updateUser).toHaveBeenCalledWith(
        userId,
        updateDto,
        'admin-id-123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should update user role to SUPER_ADMIN', async () => {
      const userId = 'user-123';
      const updateDto = { role: 'SUPER_ADMIN' as const };
      const mockUpdatedUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'SUPER_ADMIN' as const,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.updateUser.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateUser(userId, updateDto, mockRequest);

      expect(service.updateUser).toHaveBeenCalledWith(
        userId,
        updateDto,
        'admin-id-123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('blockUser', () => {
    it('should block a user', async () => {
      const userId = 'user-123';
      const mockBlockedUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER' as const,
        isBlocked: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.blockUser.mockResolvedValue(mockBlockedUser);

      const result = await controller.blockUser(userId, mockRequest);

      expect(service.blockUser).toHaveBeenCalledWith(
        userId,
        'admin-id-123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockBlockedUser);
    });
  });

  describe('unblockUser', () => {
    it('should unblock a user', async () => {
      const userId = 'user-123';
      const mockUnblockedUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER' as const,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.unblockUser.mockResolvedValue(mockUnblockedUser);

      const result = await controller.unblockUser(userId, mockRequest);

      expect(service.unblockUser).toHaveBeenCalledWith(
        userId,
        'admin-id-123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockUnblockedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = 'user-123';
      const mockResponse = { message: 'User deleted successfully' };

      service.deleteUser.mockResolvedValue(mockResponse);

      const result = await controller.deleteUser(userId, mockRequest);

      expect(service.deleteUser).toHaveBeenCalledWith(
        userId,
        'admin-id-123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const userId = 'user-123';
      const resetDto = { newPassword: 'newSecurePassword123' };
      const mockResponse = { message: 'Password reset successfully' };

      service.resetPassword.mockResolvedValue(mockResponse);

      const result = await controller.resetPassword(userId, resetDto, mockRequest);

      expect(service.resetPassword).toHaveBeenCalledWith(
        userId,
        'newSecurePassword123',
        'admin-id-123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity logs', async () => {
      const userId = 'user-123';
      const mockActivity = {
        activities: [
          {
            id: 'activity-1',
            createdAt: new Date(),
            userId,
            action: 'LOGIN',
            details: null,
            ipAddress: null,
            userAgent: null,
          },
        ],
        total: 1,
      };

      service.getUserActivity.mockResolvedValue(mockActivity);

      const result = await controller.getUserActivity(userId, 50, 0);

      expect(service.getUserActivity).toHaveBeenCalledWith(userId, 50, 0);
      expect(result).toEqual(mockActivity);
    });

    it('should use default pagination when not provided', async () => {
      const userId = 'user-123';
      const mockActivity = { activities: [], total: 0 };

      service.getUserActivity.mockResolvedValue(mockActivity);

      await controller.getUserActivity(userId);

      expect(service.getUserActivity).toHaveBeenCalledWith(userId, undefined, undefined);
    });
  });
});