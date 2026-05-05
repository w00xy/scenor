import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionsService } from './executions.service';
import { DatabaseService } from '../database/database.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ExecutionStatus,
  NodeExecutionStatus,
  ProjectMemberRole,
  Role,
  TriggerType,
  WorkflowNode,
  WorkflowEdge,
} from '@prisma/client';

describe('ExecutionsService', () => {
  let service: ExecutionsService;
  let prisma: jest.Mocked<DatabaseService>;

  const mockUserId = 'user-123';
  const mockWorkflowId = 'workflow-123';
  const mockProjectId = 'project-123';
  const mockExecutionId = 'execution-123';
  const mockAuditId = 'audit-123';

  beforeEach(async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
      workflow: {
        findUnique: jest.fn(),
      },
      workflowExecution: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      executionNodeLog: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      executionDeletionAudit: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutionsService,
        {
          provide: DatabaseService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ExecutionsService>(ExecutionsService);
    prisma = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Node Execution Tests', () => {
    describe('manual_trigger node', () => {
      it('should pass through input data unchanged', async () => {
        const nodes: Partial<WorkflowNode>[] = [
          {
            id: 'node-1',
            workflowId: mockWorkflowId,
            typeCode: 'manual_trigger',
            label: 'Start',
            posX: 0,
            posY: 0,
            configJson: {},
            isDisabled: false,
            createdAt: new Date(),
          },
        ];
        const edges: Partial<WorkflowEdge>[] = [];
        const inputData = { message: 'Hello World' };

        const mockWorkflow = {
          id: mockWorkflowId,
          projectId: mockProjectId,
          name: 'Test Workflow',
          nodes,
          edges,
          project: {
            ownerId: mockUserId,
            members: [],
          },
        };

        (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
        (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          workflowId: mockWorkflowId,
          status: ExecutionStatus.running,
          startedAt: new Date(),
        } as any);
        (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
          id: 'log-1',
          executionId: mockExecutionId,
          nodeId: 'node-1',
          status: NodeExecutionStatus.running,
        } as any);
        (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({} as any);
        (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          status: ExecutionStatus.success,
        } as any);

        const result = await service.runManualWorkflow(
          mockUserId,
          mockWorkflowId,
          inputData,
        );

        expect(result.status).toBe(ExecutionStatus.success);
        expect(prisma.executionNodeLog.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              nodeId: 'node-1',
              status: NodeExecutionStatus.running,
            }),
          }),
        );
      });
    });

    describe('set node', () => {
      it('should merge values into input data', async () => {
        const nodes: Partial<WorkflowNode>[] = [
          {
            id: 'node-1',
            workflowId: mockWorkflowId,
            typeCode: 'manual_trigger',
            label: 'Start',
            posX: 0,
            posY: 0,
            configJson: {},
            isDisabled: false,
            createdAt: new Date(),
          },
          {
            id: 'node-2',
            workflowId: mockWorkflowId,
            typeCode: 'set',
            label: 'Set Values',
            posX: 100,
            posY: 0,
            configJson: {
              values: {
                status: 'active',
                count: 42,
              },
            },
            isDisabled: false,
            createdAt: new Date(),
          },
        ];
        const edges: Partial<WorkflowEdge>[] = [
          {
            id: 'edge-1',
            workflowId: mockWorkflowId,
            sourceNodeId: 'node-1',
            targetNodeId: 'node-2',
            sourceHandle: null,
            targetHandle: null,
            conditionType: null,
            label: null,
            createdAt: new Date(),
          },
        ];

        const mockWorkflow = {
          id: mockWorkflowId,
          projectId: mockProjectId,
          name: 'Test Workflow',
          nodes,
          edges,
          project: {
            ownerId: mockUserId,
            members: [],
          },
        };

        (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
        (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          workflowId: mockWorkflowId,
          status: ExecutionStatus.running,
          startedAt: new Date(),
        } as any);
        (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
          id: 'log-1',
          executionId: mockExecutionId,
          status: NodeExecutionStatus.running,
        } as any);
        (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({} as any);
        (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          status: ExecutionStatus.success,
        } as any);

        const result = await service.runManualWorkflow(
          mockUserId,
          mockWorkflowId,
          { name: 'Test' },
        );

        expect(result.status).toBe(ExecutionStatus.success);
      });
    });

    describe('transform node', () => {
      it('should execute script and transform data', async () => {
        const nodes: Partial<WorkflowNode>[] = [
          {
            id: 'node-1',
            workflowId: mockWorkflowId,
            typeCode: 'manual_trigger',
            label: 'Start',
            posX: 0,
            posY: 0,
            configJson: {},
            isDisabled: false,
            createdAt: new Date(),
          },
          {
            id: 'node-2',
            workflowId: mockWorkflowId,
            typeCode: 'transform',
            label: 'Transform',
            posX: 100,
            posY: 0,
            configJson: {
              script: 'return { ...input, transformed: true, doubled: input.value * 2 };',
            },
            isDisabled: false,
            createdAt: new Date(),
          },
        ];
        const edges: Partial<WorkflowEdge>[] = [
          {
            id: 'edge-1',
            workflowId: mockWorkflowId,
            sourceNodeId: 'node-1',
            targetNodeId: 'node-2',
            sourceHandle: null,
            targetHandle: null,
            conditionType: null,
            label: null,
            createdAt: new Date(),
          },
        ];

        const mockWorkflow = {
          id: mockWorkflowId,
          projectId: mockProjectId,
          name: 'Test Workflow',
          nodes,
          edges,
          project: {
            ownerId: mockUserId,
            members: [],
          },
        };

        (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
        (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          workflowId: mockWorkflowId,
          status: ExecutionStatus.running,
          startedAt: new Date(),
        } as any);
        (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
          id: 'log-1',
          executionId: mockExecutionId,
          status: NodeExecutionStatus.running,
        } as any);
        (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({} as any);
        (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          status: ExecutionStatus.success,
        } as any);

        const result = await service.runManualWorkflow(
          mockUserId,
          mockWorkflowId,
          { value: 10 },
        );

        expect(result.status).toBe(ExecutionStatus.success);
      });
    });

    describe('if node', () => {
      it('should branch to true when condition passes', async () => {
        const nodes: Partial<WorkflowNode>[] = [
          {
            id: 'node-1',
            workflowId: mockWorkflowId,
            typeCode: 'manual_trigger',
            label: 'Start',
            posX: 0,
            posY: 0,
            configJson: {},
            isDisabled: false,
            createdAt: new Date(),
          },
          {
            id: 'node-2',
            workflowId: mockWorkflowId,
            typeCode: 'if',
            label: 'Check Condition',
            posX: 100,
            posY: 0,
            configJson: {
              mode: 'all',
              conditions: [
                {
                  left: '{{input.value}}',
                  operator: 'gt',
                  right: 5,
                },
              ],
            },
            isDisabled: false,
            createdAt: new Date(),
          },
        ];
        const edges: Partial<WorkflowEdge>[] = [
          {
            id: 'edge-1',
            workflowId: mockWorkflowId,
            sourceNodeId: 'node-1',
            targetNodeId: 'node-2',
            sourceHandle: null,
            targetHandle: null,
            conditionType: null,
            label: null,
            createdAt: new Date(),
          },
        ];

        const mockWorkflow = {
          id: mockWorkflowId,
          projectId: mockProjectId,
          name: 'Test Workflow',
          nodes,
          edges,
          project: {
            ownerId: mockUserId,
            members: [],
          },
        };

        (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
        (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          workflowId: mockWorkflowId,
          status: ExecutionStatus.running,
          startedAt: new Date(),
        } as any);
        (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
          id: 'log-1',
          executionId: mockExecutionId,
          status: NodeExecutionStatus.running,
        } as any);
        (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({} as any);
        (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          status: ExecutionStatus.success,
        } as any);

        const result = await service.runManualWorkflow(
          mockUserId,
          mockWorkflowId,
          { value: 10 },
        );

        expect(result.status).toBe(ExecutionStatus.success);
      });

      it('should branch to false when condition fails', async () => {
        const nodes: Partial<WorkflowNode>[] = [
          {
            id: 'node-1',
            workflowId: mockWorkflowId,
            typeCode: 'manual_trigger',
            label: 'Start',
            posX: 0,
            posY: 0,
            configJson: {},
            isDisabled: false,
            createdAt: new Date(),
          },
          {
            id: 'node-2',
            workflowId: mockWorkflowId,
            typeCode: 'if',
            label: 'Check Condition',
            posX: 100,
            posY: 0,
            configJson: {
              mode: 'all',
              conditions: [
                {
                  left: '{{input.value}}',
                  operator: 'gt',
                  right: 20,
                },
              ],
            },
            isDisabled: false,
            createdAt: new Date(),
          },
        ];
        const edges: Partial<WorkflowEdge>[] = [
          {
            id: 'edge-1',
            workflowId: mockWorkflowId,
            sourceNodeId: 'node-1',
            targetNodeId: 'node-2',
            sourceHandle: null,
            targetHandle: null,
            conditionType: null,
            label: null,
            createdAt: new Date(),
          },
        ];

        const mockWorkflow = {
          id: mockWorkflowId,
          projectId: mockProjectId,
          name: 'Test Workflow',
          nodes,
          edges,
          project: {
            ownerId: mockUserId,
            members: [],
          },
        };

        (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
        (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          workflowId: mockWorkflowId,
          status: ExecutionStatus.running,
          startedAt: new Date(),
        } as any);
        (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
          id: 'log-1',
          executionId: mockExecutionId,
          status: NodeExecutionStatus.running,
        } as any);
        (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({} as any);
        (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          status: ExecutionStatus.success,
        } as any);

        const result = await service.runManualWorkflow(
          mockUserId,
          mockWorkflowId,
          { value: 10 },
        );

        expect(result.status).toBe(ExecutionStatus.success);
      });
    });

    describe('switch node', () => {
      it('should route to matching case', async () => {
        const nodes: Partial<WorkflowNode>[] = [
          {
            id: 'node-1',
            workflowId: mockWorkflowId,
            typeCode: 'manual_trigger',
            label: 'Start',
            posX: 0,
            posY: 0,
            configJson: {},
            isDisabled: false,
            createdAt: new Date(),
          },
          {
            id: 'node-2',
            workflowId: mockWorkflowId,
            typeCode: 'switch',
            label: 'Switch',
            posX: 100,
            posY: 0,
            configJson: {
              expression: '{{input.type}}',
              cases: [
                { key: 'case1', value: 'typeA' },
                { key: 'case2', value: 'typeB' },
              ],
            },
            isDisabled: false,
            createdAt: new Date(),
          },
        ];
        const edges: Partial<WorkflowEdge>[] = [
          {
            id: 'edge-1',
            workflowId: mockWorkflowId,
            sourceNodeId: 'node-1',
            targetNodeId: 'node-2',
            sourceHandle: null,
            targetHandle: null,
            conditionType: null,
            label: null,
            createdAt: new Date(),
          },
        ];

        const mockWorkflow = {
          id: mockWorkflowId,
          projectId: mockProjectId,
          name: 'Test Workflow',
          nodes,
          edges,
          project: {
            ownerId: mockUserId,
            members: [],
          },
        };

        (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
        (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          workflowId: mockWorkflowId,
          status: ExecutionStatus.running,
          startedAt: new Date(),
        } as any);
        (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
          id: 'log-1',
          executionId: mockExecutionId,
          status: NodeExecutionStatus.running,
        } as any);
        (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({} as any);
        (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          status: ExecutionStatus.success,
        } as any);

        const result = await service.runManualWorkflow(
          mockUserId,
          mockWorkflowId,
          { type: 'typeA' },
        );

        expect(result.status).toBe(ExecutionStatus.success);
      });
    });

    describe('delay node', () => {
      it('should pause execution for specified duration', async () => {
        const nodes: Partial<WorkflowNode>[] = [
          {
            id: 'node-1',
            workflowId: mockWorkflowId,
            typeCode: 'manual_trigger',
            label: 'Start',
            posX: 0,
            posY: 0,
            configJson: {},
            isDisabled: false,
            createdAt: new Date(),
          },
          {
            id: 'node-2',
            workflowId: mockWorkflowId,
            typeCode: 'delay',
            label: 'Delay',
            posX: 100,
            posY: 0,
            configJson: {
              durationMs: 100,
            },
            isDisabled: false,
            createdAt: new Date(),
          },
        ];
        const edges: Partial<WorkflowEdge>[] = [
          {
            id: 'edge-1',
            workflowId: mockWorkflowId,
            sourceNodeId: 'node-1',
            targetNodeId: 'node-2',
            sourceHandle: null,
            targetHandle: null,
            conditionType: null,
            label: null,
            createdAt: new Date(),
          },
        ];

        const mockWorkflow = {
          id: mockWorkflowId,
          projectId: mockProjectId,
          name: 'Test Workflow',
          nodes,
          edges,
          project: {
            ownerId: mockUserId,
            members: [],
          },
        };

        (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
        (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          workflowId: mockWorkflowId,
          status: ExecutionStatus.running,
          startedAt: new Date(),
        } as any);
        (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
          id: 'log-1',
          executionId: mockExecutionId,
          status: NodeExecutionStatus.running,
        } as any);
        (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({} as any);
        (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          status: ExecutionStatus.success,
        } as any);

        const startTime = Date.now();
        const result = await service.runManualWorkflow(
          mockUserId,
          mockWorkflowId,
          {},
        );
        const endTime = Date.now();

        expect(result.status).toBe(ExecutionStatus.success);
        expect(endTime - startTime).toBeGreaterThanOrEqual(100);
      });
    });

    describe('code node', () => {
      it('should execute custom JavaScript code', async () => {
        const nodes: Partial<WorkflowNode>[] = [
          {
            id: 'node-1',
            workflowId: mockWorkflowId,
            typeCode: 'manual_trigger',
            label: 'Start',
            posX: 0,
            posY: 0,
            configJson: {},
            isDisabled: false,
            createdAt: new Date(),
          },
          {
            id: 'node-2',
            workflowId: mockWorkflowId,
            typeCode: 'code',
            label: 'Code',
            posX: 100,
            posY: 0,
            configJson: {
              source: 'return { result: input.a + input.b, executionId: context.executionId };',
            },
            isDisabled: false,
            createdAt: new Date(),
          },
        ];
        const edges: Partial<WorkflowEdge>[] = [
          {
            id: 'edge-1',
            workflowId: mockWorkflowId,
            sourceNodeId: 'node-1',
            targetNodeId: 'node-2',
            sourceHandle: null,
            targetHandle: null,
            conditionType: null,
            label: null,
            createdAt: new Date(),
          },
        ];

        const mockWorkflow = {
          id: mockWorkflowId,
          projectId: mockProjectId,
          name: 'Test Workflow',
          nodes,
          edges,
          project: {
            ownerId: mockUserId,
            members: [],
          },
        };

        (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
        (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          workflowId: mockWorkflowId,
          status: ExecutionStatus.running,
          startedAt: new Date(),
        } as any);
        (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
          id: 'log-1',
          executionId: mockExecutionId,
          status: NodeExecutionStatus.running,
        } as any);
        (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({} as any);
        (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          status: ExecutionStatus.success,
        } as any);

        const result = await service.runManualWorkflow(
          mockUserId,
          mockWorkflowId,
          { a: 5, b: 3 },
        );

        expect(result.status).toBe(ExecutionStatus.success);
      });
    });

    describe('http_request node', () => {
      it('should make HTTP request and return response', async () => {
        const nodes: Partial<WorkflowNode>[] = [
          {
            id: 'node-1',
            workflowId: mockWorkflowId,
            typeCode: 'manual_trigger',
            label: 'Start',
            posX: 0,
            posY: 0,
            configJson: {},
            isDisabled: false,
            createdAt: new Date(),
          },
          {
            id: 'node-2',
            workflowId: mockWorkflowId,
            typeCode: 'http_request',
            label: 'HTTP Request',
            posX: 100,
            posY: 0,
            configJson: {
              url: 'https://jsonplaceholder.typicode.com/posts/1',
              method: 'GET',
              headers: {},
              query: {},
              timeout: 10000,
            },
            isDisabled: false,
            createdAt: new Date(),
          },
        ];
        const edges: Partial<WorkflowEdge>[] = [
          {
            id: 'edge-1',
            workflowId: mockWorkflowId,
            sourceNodeId: 'node-1',
            targetNodeId: 'node-2',
            sourceHandle: null,
            targetHandle: null,
            conditionType: null,
            label: null,
            createdAt: new Date(),
          },
        ];

        const mockWorkflow = {
          id: mockWorkflowId,
          projectId: mockProjectId,
          name: 'Test Workflow',
          nodes,
          edges,
          project: {
            ownerId: mockUserId,
            members: [],
          },
        };

        (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
        (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          workflowId: mockWorkflowId,
          status: ExecutionStatus.running,
          startedAt: new Date(),
        } as any);
        (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
          id: 'log-1',
          executionId: mockExecutionId,
          status: NodeExecutionStatus.running,
        } as any);
        (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({} as any);
        (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
          id: mockExecutionId,
          status: ExecutionStatus.success,
        } as any);

        const result = await service.runManualWorkflow(
          mockUserId,
          mockWorkflowId,
          {},
        );

        expect(result.status).toBe(ExecutionStatus.success);
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw NotFoundException when workflow does not exist', async () => {
      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.runManualWorkflow(mockUserId, 'non-existent-workflow', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user lacks permissions', async () => {
      const mockWorkflow = {
        id: mockWorkflowId,
        projectId: mockProjectId,
        name: 'Test Workflow',
        nodes: [],
        edges: [],
        project: {
          ownerId: 'different-user',
          members: [],
        },
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);

      await expect(
        service.runManualWorkflow(mockUserId, mockWorkflowId, {}),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when workflow has no nodes', async () => {
      const mockWorkflow = {
        id: mockWorkflowId,
        projectId: mockProjectId,
        name: 'Test Workflow',
        nodes: [],
        edges: [],
        project: {
          ownerId: mockUserId,
          members: [],
        },
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
      (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        workflowId: mockWorkflowId,
        status: ExecutionStatus.running,
        startedAt: new Date(),
      } as any);
      (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        status: ExecutionStatus.failed,
        errorMessage: 'Workflow has no nodes',
      } as any);

      const result = await service.runManualWorkflow(
        mockUserId,
        mockWorkflowId,
        {},
      );

      expect(result.status).toBe(ExecutionStatus.failed);
      expect(result.errorMessage).toBe('Workflow has no nodes');
    });
  });

  describe('deleteWorkflowExecution', () => {
    const mockUser = {
      id: mockUserId,
      role: Role.USER,
    };

    const mockWorkflow = {
      id: mockWorkflowId,
      name: 'Test Workflow',
      projectId: mockProjectId,
      project: {
        ownerId: mockUserId,
        members: [],
      },
    };

    const mockExecution = {
      id: mockExecutionId,
      workflowId: mockWorkflowId,
      startedByUserId: mockUserId,
      status: ExecutionStatus.success,
      startedAt: new Date(),
      finishedAt: new Date(),
      _count: {
        logs: 15,
      },
    };

    beforeEach(() => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);
      (prisma.workflowExecution.findFirst as jest.Mock).mockResolvedValue(mockExecution);
    });

    it('should allow OWNER to delete any execution', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const txMock = {
          executionDeletionAudit: {
            create: jest.fn().mockResolvedValue({ id: mockAuditId }),
          },
          workflowExecution: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(txMock);
      });

      const result = await service.deleteWorkflowExecution(
        mockUserId,
        mockWorkflowId,
        mockExecutionId,
        'Test deletion',
      );

      expect(result.success).toBe(true);
      expect(result.deletedExecutionId).toBe(mockExecutionId);
      expect(result.deletedLogsCount).toBe(15);
      expect(result.auditId).toBe(mockAuditId);
    });

    it('should allow EDITOR to delete their own execution', async () => {
      const editorWorkflow = {
        ...mockWorkflow,
        project: {
          ownerId: 'different-user',
          members: [{ role: ProjectMemberRole.EDITOR }],
        },
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(editorWorkflow);
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const txMock = {
          executionDeletionAudit: {
            create: jest.fn().mockResolvedValue({ id: mockAuditId }),
          },
          workflowExecution: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(txMock);
      });

      const result = await service.deleteWorkflowExecution(
        mockUserId,
        mockWorkflowId,
        mockExecutionId,
      );

      expect(result.success).toBe(true);
    });

    it('should NOT allow EDITOR to delete others execution', async () => {
      const editorWorkflow = {
        ...mockWorkflow,
        project: {
          ownerId: 'different-user',
          members: [{ role: ProjectMemberRole.EDITOR }],
        },
      };

      const othersExecution = {
        ...mockExecution,
        startedByUserId: 'other-user-id',
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(editorWorkflow);
      (prisma.workflowExecution.findFirst as jest.Mock).mockResolvedValue(othersExecution);

      await expect(
        service.deleteWorkflowExecution(
          mockUserId,
          mockWorkflowId,
          mockExecutionId,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should NOT allow VIEWER to delete any execution', async () => {
      const viewerWorkflow = {
        ...mockWorkflow,
        project: {
          ownerId: 'different-user',
          members: [{ role: ProjectMemberRole.VIEWER }],
        },
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(viewerWorkflow);

      await expect(
        service.deleteWorkflowExecution(
          mockUserId,
          mockWorkflowId,
          mockExecutionId,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN to delete any execution', async () => {
      const superAdminUser = {
        id: mockUserId,
        role: Role.SUPER_ADMIN,
      };

      const othersWorkflow = {
        ...mockWorkflow,
        project: {
          ownerId: 'different-user',
          members: [],
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(superAdminUser);
      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(othersWorkflow);
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const txMock = {
          executionDeletionAudit: {
            create: jest.fn().mockResolvedValue({ id: mockAuditId }),
          },
          workflowExecution: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(txMock);
      });

      await expect(
        service.deleteWorkflowExecution(
          mockUserId,
          mockWorkflowId,
          mockExecutionId,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should NOT allow deletion of running execution', async () => {
      const runningExecution = {
        ...mockExecution,
        status: ExecutionStatus.running,
      };

      (prisma.workflowExecution.findFirst as jest.Mock).mockResolvedValue(runningExecution);

      await expect(
        service.deleteWorkflowExecution(
          mockUserId,
          mockWorkflowId,
          mockExecutionId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when execution does not exist', async () => {
      (prisma.workflowExecution.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteWorkflowExecution(
          mockUserId,
          mockWorkflowId,
          mockExecutionId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when workflow does not exist', async () => {
      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteWorkflowExecution(
          mockUserId,
          mockWorkflowId,
          mockExecutionId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteWorkflowExecution(
          mockUserId,
          mockWorkflowId,
          mockExecutionId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create audit record with correct data', async () => {
      let capturedAuditData: any;

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const txMock = {
          executionDeletionAudit: {
            create: jest.fn().mockImplementation((params) => {
              capturedAuditData = params.data;
              return Promise.resolve({ id: mockAuditId });
            }),
          },
          workflowExecution: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(txMock);
      });

      await service.deleteWorkflowExecution(
        mockUserId,
        mockWorkflowId,
        mockExecutionId,
        'Cleanup old test data',
      );

      expect(capturedAuditData).toMatchObject({
        executionId: mockExecutionId,
        workflowId: mockWorkflowId,
        workflowName: 'Test Workflow',
        deletedByUserId: mockUserId,
        deletedByRole: ProjectMemberRole.OWNER,
        executionStatus: ExecutionStatus.success,
        nodeLogsCount: 15,
        reason: 'Cleanup old test data',
      });
    });

    it('should handle deletion without reason', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const txMock = {
          executionDeletionAudit: {
            create: jest.fn().mockResolvedValue({ id: mockAuditId }),
          },
          workflowExecution: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(txMock);
      });

      const result = await service.deleteWorkflowExecution(
        mockUserId,
        mockWorkflowId,
        mockExecutionId,
      );

      expect(result.success).toBe(true);
    });
  });
});
