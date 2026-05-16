import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuditController } from './admin-audit.controller';
import { AdminAuditService } from '../services/admin-audit.service';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../../auth/auth.guard.js';

describe('AdminAuditController', () => {
  let controller: AdminAuditController;
  let service: jest.Mocked<AdminAuditService>;

  const mockAdminAuditService = {
    getAuditLogs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuditController],
      providers: [
        {
          provide: AdminAuditService,
          useValue: mockAdminAuditService,
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

    controller = module.get<AdminAuditController>(AdminAuditController);
    service = module.get(AdminAuditService) as jest.Mocked<AdminAuditService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs', async () => {
      const query = { limit: 10, offset: 0 };
      const mockResult = {
        logs: [
          {
            id: 'log-1',
            adminId: 'admin-123',
            action: 'USER_UPDATE',
            targetType: 'USER',
            targetId: 'user-456',
            details: { changes: { role: 'SUPER_ADMIN' } },
            ipAddress: '127.0.0.1',
            userAgent: 'test-agent',
            createdAt: new Date('2026-05-06'),
            admin: {
              id: 'admin-123',
              username: 'admin',
              email: 'admin@example.com',
            },
          },
        ],
        total: 1,
      };

      service.getAuditLogs.mockResolvedValue(mockResult);

      const result = await controller.getAuditLogs(query);

      expect(service.getAuditLogs).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should filter audit logs by action', async () => {
      const query = { action: 'USER_DELETE', limit: 50, offset: 0 };
      const mockResult = {
        logs: [
          {
            id: 'log-2',
            adminId: 'admin-123',
            action: 'USER_DELETE',
            targetType: 'USER',
            targetId: 'user-789',
            details: { email: 'deleted@example.com', username: 'deleteduser' },
            ipAddress: '127.0.0.1',
            userAgent: 'test-agent',
            createdAt: new Date('2026-05-05'),
            admin: {
              id: 'admin-123',
              username: 'admin',
              email: 'admin@example.com',
            },
          },
        ],
        total: 1,
      };

      service.getAuditLogs.mockResolvedValue(mockResult);

      const result = await controller.getAuditLogs(query);

      expect(service.getAuditLogs).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should filter audit logs by target type', async () => {
      const query = { targetType: 'PROJECT', limit: 50, offset: 0 };
      const mockResult = {
        logs: [
          {
            id: 'log-3',
            adminId: 'admin-123',
            action: 'PROJECT_DELETE',
            targetType: 'PROJECT',
            targetId: 'project-123',
            details: { name: 'Test Project', type: 'PERSONAL' },
            ipAddress: '127.0.0.1',
            userAgent: 'test-agent',
            createdAt: new Date('2026-05-04'),
            admin: {
              id: 'admin-123',
              username: 'admin',
              email: 'admin@example.com',
            },
          },
        ],
        total: 1,
      };

      service.getAuditLogs.mockResolvedValue(mockResult);

      const result = await controller.getAuditLogs(query);

      expect(service.getAuditLogs).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should filter audit logs by admin id', async () => {
      const query = { adminId: 'admin-456', limit: 50, offset: 0 };
      const mockResult = {
        logs: [
          {
            id: 'log-4',
            adminId: 'admin-456',
            action: 'USER_BLOCK',
            targetType: 'USER',
            targetId: 'user-999',
            details: null,
            ipAddress: '192.168.1.1',
            userAgent: 'another-agent',
            createdAt: new Date('2026-05-03'),
            admin: {
              id: 'admin-456',
              username: 'admin2',
              email: 'admin2@example.com',
            },
          },
        ],
        total: 1,
      };

      service.getAuditLogs.mockResolvedValue(mockResult);

      const result = await controller.getAuditLogs(query);

      expect(service.getAuditLogs).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should filter audit logs with multiple filters', async () => {
      const query = {
        action: 'PROJECT_TRANSFER_OWNERSHIP',
        targetType: 'PROJECT',
        adminId: 'admin-123',
        limit: 20,
        offset: 0,
      };
      const mockResult = {
        logs: [
          {
            id: 'log-5',
            adminId: 'admin-123',
            action: 'PROJECT_TRANSFER_OWNERSHIP',
            targetType: 'PROJECT',
            targetId: 'project-555',
            details: { oldOwnerId: 'user-111', newOwnerId: 'user-222' },
            ipAddress: '127.0.0.1',
            userAgent: 'test-agent',
            createdAt: new Date('2026-05-02'),
            admin: {
              id: 'admin-123',
              username: 'admin',
              email: 'admin@example.com',
            },
          },
        ],
        total: 1,
      };

      service.getAuditLogs.mockResolvedValue(mockResult);

      const result = await controller.getAuditLogs(query);

      expect(service.getAuditLogs).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should return empty logs when no matches found', async () => {
      const query = { action: 'NONEXISTENT_ACTION', limit: 50, offset: 0 };
      const mockResult = { logs: [], total: 0 };

      service.getAuditLogs.mockResolvedValue(mockResult);

      const result = await controller.getAuditLogs(query);

      expect(service.getAuditLogs).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });
});