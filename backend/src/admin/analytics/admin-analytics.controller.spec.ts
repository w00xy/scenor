import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsService } from '../services/admin-analytics.service';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';

describe('AdminAnalyticsController', () => {
  let controller: AdminAnalyticsController;
  let service: jest.Mocked<AdminAnalyticsService>;

  const mockAdminAnalyticsService = {
    getPlatformStatistics: jest.fn(),
    getExecutionAnalytics: jest.fn(),
    getUserAnalytics: jest.fn(),
    getRegistrationTrend: jest.fn(),
    getExecutionTrend: jest.fn(),
    getNodeTypeUsage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAnalyticsController],
      providers: [
        {
          provide: AdminAnalyticsService,
          useValue: mockAdminAnalyticsService,
        },
        {
          provide: AdminGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: AuthGuard('jwt'),
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<AdminAnalyticsController>(AdminAnalyticsController);
    service = module.get(AdminAnalyticsService) as jest.Mocked<AdminAnalyticsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPlatformStatistics', () => {
    it('should return platform statistics', async () => {
      const mockStatistics = {
        users: {
          total: 100,
          active: 95,
          blocked: 5,
        },
        projects: {
          total: 50,
          byType: [
            { type: 'PERSONAL' as const, _count: 30 },
            { type: 'TEAM' as const, _count: 20 },
          ],
        },
        workflows: {
          total: 200,
          byStatus: [
            { status: 'active' as const, _count: 150 },
            { status: 'inactive' as const, _count: 50 },
          ],
        },
        executions: {
          total: 1000,
          byStatus: [
            { status: 'success' as const, _count: 800 },
            { status: 'failed' as const, _count: 150 },
            { status: 'running' as const, _count: 50 },
          ],
        },
      };

      service.getPlatformStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getPlatformStatistics();

      expect(service.getPlatformStatistics).toHaveBeenCalled();
      expect(result).toEqual(mockStatistics);
    });
  });

  describe('getExecutionAnalytics', () => {
    it('should return execution analytics without date filters', async () => {
      const query = {};
      const mockAnalytics = {
        totalExecutions: 1000,
        executionsByStatus: [
          { status: 'success' as const, _count: 800 },
          { status: 'failed' as const, _count: 200 },
        ],
        successRate: '80.00',
        avgExecutionTime: 45.5,
      };

      service.getExecutionAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getExecutionAnalytics(query);

      expect(service.getExecutionAnalytics).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockAnalytics);
    });

    it('should return execution analytics with date filters', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');
      const query = { startDate, endDate };
      const mockAnalytics = {
        totalExecutions: 100,
        executionsByStatus: [
          { status: 'success' as const, _count: 90 },
          { status: 'failed' as const, _count: 10 },
        ],
        successRate: '90.00',
        avgExecutionTime: 30.2,
      };

      service.getExecutionAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getExecutionAnalytics(query);

      expect(service.getExecutionAnalytics).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('getUserAnalytics', () => {
    it('should return user analytics', async () => {
      const mockAnalytics = {
        topUsersByProjects: [
          {
            id: 'user-1',
            username: 'user1',
            email: 'user1@example.com',
            _count: { projects: 10 },
          },
        ],
        topUsersByWorkflows: [
          {
            id: 'user-2',
            username: 'user2',
            email: 'user2@example.com',
            _count: { createdWorkflows: 20 },
          },
        ],
        topUsersByExecutions: [
          {
            id: 'user-3',
            username: 'user3',
            email: 'user3@example.com',
            _count: { startedExecutions: 100 },
          },
        ],
        inactiveUsers: [
          {
            id: 'user-4',
            username: 'user4',
            email: 'user4@example.com',
            createdAt: new Date('2025-01-01'),
          },
        ],
      };

      service.getUserAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getUserAnalytics();

      expect(service.getUserAnalytics).toHaveBeenCalled();
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('getRegistrationTrend', () => {
    it('should return registration trend with default days', async () => {
      const query = {};
      const mockTrend = [
        { date: '2026-04-01', count: 5 },
        { date: '2026-04-02', count: 3 },
        { date: '2026-04-03', count: 7 },
      ];

      service.getRegistrationTrend.mockResolvedValue(mockTrend);

      const result = await controller.getRegistrationTrend(query);

      expect(service.getRegistrationTrend).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockTrend);
    });

    it('should return registration trend with custom days', async () => {
      const query = { days: 7 };
      const mockTrend = [
        { date: '2026-04-30', count: 2 },
        { date: '2026-05-01', count: 4 },
      ];

      service.getRegistrationTrend.mockResolvedValue(mockTrend);

      const result = await controller.getRegistrationTrend(query);

      expect(service.getRegistrationTrend).toHaveBeenCalledWith(7);
      expect(result).toEqual(mockTrend);
    });
  });

  describe('getExecutionTrend', () => {
    it('should return execution trend with default days', async () => {
      const query = {};
      const mockTrend = [
        { date: '2026-04-01', status: 'SUCCESS', count: 50 },
        { date: '2026-04-01', status: 'FAILED', count: 5 },
        { date: '2026-04-02', status: 'SUCCESS', count: 60 },
      ];

      service.getExecutionTrend.mockResolvedValue(mockTrend);

      const result = await controller.getExecutionTrend(query);

      expect(service.getExecutionTrend).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockTrend);
    });

    it('should return execution trend with custom days', async () => {
      const query = { days: 14 };
      const mockTrend = [
        { date: '2026-04-20', status: 'SUCCESS', count: 40 },
        { date: '2026-04-21', status: 'SUCCESS', count: 45 },
      ];

      service.getExecutionTrend.mockResolvedValue(mockTrend);

      const result = await controller.getExecutionTrend(query);

      expect(service.getExecutionTrend).toHaveBeenCalledWith(14);
      expect(result).toEqual(mockTrend);
    });
  });

  describe('getNodeTypeUsage', () => {
    it('should return node type usage statistics', async () => {
      const mockUsage = [
        { typeCode: 'http-request', _count: 500 },
        { typeCode: 'transform', _count: 300 },
        { typeCode: 'condition', _count: 200 },
        { typeCode: 'loop', _count: 100 },
      ];

      service.getNodeTypeUsage.mockResolvedValue(mockUsage);

      const result = await controller.getNodeTypeUsage();

      expect(service.getNodeTypeUsage).toHaveBeenCalled();
      expect(result).toEqual(mockUsage);
    });
  });
});
