import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminWorkflowsService } from './admin-workflows.service';
import { DatabaseService } from '../../database/database.service';
import { AdminAuditService } from './admin-audit.service';

describe('AdminWorkflowsService', () => {
  let service: AdminWorkflowsService;
  let databaseService: DatabaseService;
  let auditService: AdminAuditService;

  const mockDatabaseService = {
    workflow: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    workflowNode: {
      count: jest.fn(),
    },
    workflowEdge: {
      count: jest.fn(),
    },
    workflowExecution: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockAuditService = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminWorkflowsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: AdminAuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<AdminWorkflowsService>(AdminWorkflowsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    auditService = module.get<AdminAuditService>(AdminAuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllWorkflows', () => {
    it('should return workflows with pagination', async () => {
      const mockWorkflows = [
        {
          id: '1',
          name: 'Test Workflow',
          status: 'active',
          project: { id: 'p1', name: 'Project 1', owner: { id: 'u1', username: 'user1', email: 'user1@test.com' } },
          creator: { id: 'u1', username: 'user1', email: 'user1@test.com' },
          _count: { nodes: 5, edges: 4, executions: 10 },
        },
      ];

      mockDatabaseService.workflow.findMany.mockResolvedValue(mockWorkflows);
      mockDatabaseService.workflow.count.mockResolvedValue(1);

      const result = await service.getAllWorkflows({ limit: 50, offset: 0 });

      expect(result).toEqual({ workflows: mockWorkflows, total: 1 });
      expect(mockDatabaseService.workflow.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should filter workflows by search term', async () => {
      mockDatabaseService.workflow.findMany.mockResolvedValue([]);
      mockDatabaseService.workflow.count.mockResolvedValue(0);

      await service.getAllWorkflows({ search: 'test', limit: 50, offset: 0 });

      expect(mockDatabaseService.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should filter workflows by status', async () => {
      mockDatabaseService.workflow.findMany.mockResolvedValue([]);
      mockDatabaseService.workflow.count.mockResolvedValue(0);

      await service.getAllWorkflows({ status: 'active', limit: 50, offset: 0 });

      expect(mockDatabaseService.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'active' },
        }),
      );
    });

    it('should filter workflows by projectId', async () => {
      mockDatabaseService.workflow.findMany.mockResolvedValue([]);
      mockDatabaseService.workflow.count.mockResolvedValue(0);

      await service.getAllWorkflows({ projectId: 'p1', limit: 50, offset: 0 });

      expect(mockDatabaseService.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: 'p1' },
        }),
      );
    });

    it('should filter workflows by createdBy', async () => {
      mockDatabaseService.workflow.findMany.mockResolvedValue([]);
      mockDatabaseService.workflow.count.mockResolvedValue(0);

      await service.getAllWorkflows({ createdBy: 'u1', limit: 50, offset: 0 });

      expect(mockDatabaseService.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdBy: 'u1' },
        }),
      );
    });
  });

  describe('getWorkflowById', () => {
    it('should return workflow with full details', async () => {
      const mockWorkflow = {
        id: '1',
        name: 'Test Workflow',
        project: { id: 'p1', name: 'Project 1', owner: { id: 'u1', username: 'user1', email: 'user1@test.com' } },
        creator: { id: 'u1', username: 'user1', email: 'user1@test.com' },
        nodes: [{ id: 'n1', name: 'Node 1', nodeType: { id: 't1', name: 'Type 1' } }],
        edges: [{ id: 'e1', sourceNodeId: 'n1', targetNodeId: 'n2' }],
        _count: { executions: 10 },
      };

      mockDatabaseService.workflow.findUnique.mockResolvedValue(mockWorkflow);

      const result = await service.getWorkflowById('1');

      expect(result).toEqual(mockWorkflow);
      expect(mockDatabaseService.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.objectContaining({
          project: expect.any(Object),
          creator: expect.any(Object),
          nodes: expect.any(Object),
          edges: true,
          _count: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundException when workflow not found', async () => {
      mockDatabaseService.workflow.findUnique.mockResolvedValue(null);

      await expect(service.getWorkflowById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete workflow and log audit action', async () => {
      const mockWorkflow = {
        id: '1',
        name: 'Test Workflow',
        projectId: 'p1',
        project: { name: 'Project 1' },
      };

      mockDatabaseService.workflow.findUnique.mockResolvedValue(mockWorkflow);
      mockDatabaseService.workflow.delete.mockResolvedValue(mockWorkflow);
      mockAuditService.logAction.mockResolvedValue({});

      const result = await service.deleteWorkflow(
        '1',
        'admin-id',
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toEqual({ message: 'Workflow deleted successfully' });
      expect(mockDatabaseService.workflow.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockAuditService.logAction).toHaveBeenCalledWith({
        adminId: 'admin-id',
        action: 'WORKFLOW_DELETE',
        targetType: 'WORKFLOW',
        targetId: '1',
        details: {
          name: 'Test Workflow',
          projectId: 'p1',
          projectName: 'Project 1',
        },
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      });
    });

    it('should throw NotFoundException when workflow not found', async () => {
      mockDatabaseService.workflow.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteWorkflow('999', 'admin-id', '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWorkflowStatistics', () => {
    it('should return workflow statistics', async () => {
      const mockWorkflow = { id: '1', name: 'Test Workflow' };
      const mockExecutionsByStatus = [
        { status: 'success', _count: 5 },
        { status: 'failed', _count: 2 },
      ];
      const mockLastExecution = {
        id: 'e1',
        status: 'success',
        startedAt: new Date(),
        finishedAt: new Date(),
      };

      mockDatabaseService.workflow.findUnique.mockResolvedValue(mockWorkflow);
      mockDatabaseService.workflowNode.count.mockResolvedValue(10);
      mockDatabaseService.workflowEdge.count.mockResolvedValue(8);
      mockDatabaseService.workflowExecution.count.mockResolvedValue(7);
      mockDatabaseService.workflowExecution.groupBy.mockResolvedValue(
        mockExecutionsByStatus,
      );
      mockDatabaseService.workflowExecution.findFirst.mockResolvedValue(
        mockLastExecution,
      );

      const result = await service.getWorkflowStatistics('1');

      expect(result).toEqual({
        nodesCount: 10,
        edgesCount: 8,
        executionsCount: 7,
        executionsByStatus: mockExecutionsByStatus,
        lastExecution: mockLastExecution,
      });
    });

    it('should throw NotFoundException when workflow not found', async () => {
      mockDatabaseService.workflow.findUnique.mockResolvedValue(null);

      await expect(service.getWorkflowStatistics('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
