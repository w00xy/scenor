import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowSharesService } from './workflow-shares.service';
import { DatabaseService } from '../database/database.service';
import { ProjectMemberRole } from '@prisma/client';

describe('WorkflowSharesService', () => {
  let service: WorkflowSharesService;
  let prisma: jest.Mocked<DatabaseService>;

  const mockUserId = 'user-123';
  const mockWorkflowId = 'workflow-123';
  const mockShareId = 'share-123';
  const mockToken = 'share-token-abc123';

  beforeEach(async () => {
    const prismaMock = {
      workflow: {
        findUnique: jest.fn(),
      },
      workflowShare: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowSharesService,
        {
          provide: DatabaseService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<WorkflowSharesService>(WorkflowSharesService);
    prisma = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWorkflowShare', () => {
    it('should create a workflow share', async () => {
      const mockWorkflow = {
        id: mockWorkflowId,
        projectId: 'project-123',
        createdBy: mockUserId,
        name: 'Test Workflow',
        project: {
          ownerId: mockUserId,
          members: [],
        },
      };

      const mockShare = {
        id: mockShareId,
        workflowId: mockWorkflowId,
        createdBy: mockUserId,
        token: mockToken,
        isPublic: true,
        createdAt: new Date(),
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);
      (prisma.workflowShare.create as jest.Mock).mockResolvedValue(mockShare);

      const result = await service.createWorkflowShare(mockUserId, mockWorkflowId, {
        isPublic: true,
      });

      expect(result).toEqual(mockShare);
      expect(prisma.workflowShare.create).toHaveBeenCalled();
    });
  });

  describe('listWorkflowShares', () => {
    it('should list all shares for a workflow', async () => {
      const mockWorkflow = {
        id: mockWorkflowId,
        projectId: 'project-123',
        createdBy: mockUserId,
        name: 'Test Workflow',
        project: {
          ownerId: mockUserId,
          members: [],
        },
      };

      const mockShares = [
        {
          id: mockShareId,
          workflowId: mockWorkflowId,
          createdBy: mockUserId,
          token: mockToken,
          isPublic: true,
          createdAt: new Date(),
        },
      ];

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);
      (prisma.workflowShare.findMany as jest.Mock).mockResolvedValue(mockShares);

      const result = await service.listWorkflowShares(mockUserId, mockWorkflowId);

      expect(result).toEqual(mockShares);
      expect(prisma.workflowShare.findMany).toHaveBeenCalledWith({
        where: { workflowId: mockWorkflowId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('deleteWorkflowShare', () => {
    it('should delete a workflow share', async () => {
      const mockWorkflow = {
        id: mockWorkflowId,
        projectId: 'project-123',
        createdBy: mockUserId,
        name: 'Test Workflow',
        project: {
          ownerId: mockUserId,
          members: [],
        },
      };

      const mockShare = {
        id: mockShareId,
        workflowId: mockWorkflowId,
        createdBy: mockUserId,
        token: mockToken,
        isPublic: true,
        createdAt: new Date(),
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);
      (prisma.workflowShare.findUnique as jest.Mock).mockResolvedValue(mockShare);
      (prisma.workflowShare.delete as jest.Mock).mockResolvedValue(mockShare);

      const result = await service.deleteWorkflowShare(mockUserId, mockWorkflowId, mockShareId);

      expect(result).toEqual(mockShare);
      expect(prisma.workflowShare.delete).toHaveBeenCalledWith({
        where: { id: mockShareId },
      });
    });
  });
});
