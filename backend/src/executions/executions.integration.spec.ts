import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionsService } from './executions.service';
import { DatabaseService } from '../database/database.service';
import {
  ExecutionStatus,
  NodeExecutionStatus,
  WorkflowNode,
  WorkflowEdge,
} from '@prisma/client';

describe('ExecutionsService - Integration Tests (Workflow Chains)', () => {
  let service: ExecutionsService;
  let prisma: jest.Mocked<DatabaseService>;

  const mockUserId = 'user-123';
  const mockWorkflowId = 'workflow-123';
  const mockProjectId = 'project-123';
  const mockExecutionId = 'execution-123';

  beforeEach(async () => {
    const prismaMock = {
      workflow: {
        findUnique: jest.fn(),
      },
      workflowExecution: {
        create: jest.fn(),
        update: jest.fn(),
      },
      executionNodeLog: {
        create: jest.fn(),
        update: jest.fn(),
      },
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
    prisma = module.get(DatabaseService);
  });

  describe('Complete Workflow Chain: Data Processing Pipeline', () => {
    it('should execute: trigger -> set -> transform -> if -> set (success path)', async () => {
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
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-2',
          workflowId: mockWorkflowId,
          typeCode: 'set',
          label: 'Set Initial Data',
          posX: 100,
          posY: 0,
          configJson: {
            values: {
              userId: 'user-456',
              action: 'purchase',
            },
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-3',
          workflowId: mockWorkflowId,
          typeCode: 'transform',
          label: 'Calculate Total',
          posX: 200,
          posY: 0,
          configJson: {
            script:
              'return { ...input, total: input.price * input.quantity, processed: true };',
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-4',
          workflowId: mockWorkflowId,
          typeCode: 'if',
          label: 'Check Total',
          posX: 300,
          posY: 0,
          configJson: {
            mode: 'all',
            conditions: [
              {
                left: '{{input.total}}',
                operator: 'gte',
                right: 100,
              },
            ],
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-5',
          workflowId: mockWorkflowId,
          typeCode: 'set',
          label: 'Apply Discount',
          posX: 400,
          posY: -50,
          configJson: {
            values: {
              discount: 10,
              discountApplied: true,
            },
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
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
        {
          id: 'edge-2',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-2',
          targetNodeId: 'node-3',
          sourceHandle: null,
          targetHandle: null,
          conditionType: null,
          label: null,
          createdAt: new Date(),
        },
        {
          id: 'edge-3',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-3',
          targetNodeId: 'node-4',
          sourceHandle: null,
          targetHandle: null,
          conditionType: null,
          label: null,
          createdAt: new Date(),
        },
        {
          id: 'edge-4',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-4',
          targetNodeId: 'node-5',
          sourceHandle: 'true',
          targetHandle: null,
          conditionType: 'true',
          label: 'true',
          createdAt: new Date(),
        },
      ];

      const mockWorkflow = {
        id: mockWorkflowId,
        projectId: mockProjectId,
        name: 'Data Processing Pipeline',
        nodes,
        edges,
        project: {
          ownerId: mockUserId,
          members: [],
        },
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockWorkflow as any,
      );
      (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        workflowId: mockWorkflowId,
        status: ExecutionStatus.running,
        startedAt: new Date(),
      });
      (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
        id: 'log-1',
        executionId: mockExecutionId,
        status: NodeExecutionStatus.running,
      });
      (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({});
      (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        status: ExecutionStatus.success,
      });

      const result = await service.runManualWorkflow(
        mockUserId,
        mockWorkflowId,
        { price: 50, quantity: 3 },
      );

      expect(result.status).toBe(ExecutionStatus.success);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.executionNodeLog.create).toHaveBeenCalledTimes(5);
    });
  });

  describe('Complete Workflow Chain: Multi-Branch Switch', () => {
    it('should execute: trigger -> switch -> different paths based on input', async () => {
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
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-2',
          workflowId: mockWorkflowId,
          typeCode: 'switch',
          label: 'Route by Type',
          posX: 100,
          posY: 0,
          configJson: {
            expression: '{{input.orderType}}',
            cases: [
              { key: 'express', value: 'express' },
              { key: 'standard', value: 'standard' },
              { key: 'economy', value: 'economy' },
            ],
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-3',
          workflowId: mockWorkflowId,
          typeCode: 'set',
          label: 'Express Processing',
          posX: 200,
          posY: -100,
          configJson: {
            values: {
              priority: 'high',
              deliveryDays: 1,
            },
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-4',
          workflowId: mockWorkflowId,
          typeCode: 'set',
          label: 'Standard Processing',
          posX: 200,
          posY: 0,
          configJson: {
            values: {
              priority: 'medium',
              deliveryDays: 3,
            },
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-5',
          workflowId: mockWorkflowId,
          typeCode: 'set',
          label: 'Economy Processing',
          posX: 200,
          posY: 100,
          configJson: {
            values: {
              priority: 'low',
              deliveryDays: 7,
            },
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
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
        {
          id: 'edge-2',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-2',
          targetNodeId: 'node-3',
          sourceHandle: 'express',
          targetHandle: null,
          conditionType: 'express',
          label: 'express',
          createdAt: new Date(),
        },
        {
          id: 'edge-3',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-2',
          targetNodeId: 'node-4',
          sourceHandle: 'standard',
          targetHandle: null,
          conditionType: 'standard',
          label: 'standard',
          createdAt: new Date(),
        },
        {
          id: 'edge-4',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-2',
          targetNodeId: 'node-5',
          sourceHandle: 'economy',
          targetHandle: null,
          conditionType: 'economy',
          label: 'economy',
          createdAt: new Date(),
        },
      ];

      const mockWorkflow = {
        id: mockWorkflowId,
        projectId: mockProjectId,
        name: 'Multi-Branch Switch',
        nodes,
        edges,
        project: {
          ownerId: mockUserId,
          members: [],
        },
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockWorkflow as any,
      );
      (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        workflowId: mockWorkflowId,
        status: ExecutionStatus.running,
        startedAt: new Date(),
      });
      (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
        id: 'log-1',
        executionId: mockExecutionId,
        status: NodeExecutionStatus.running,
      });
      (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({});
      (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        status: ExecutionStatus.success,
      });

      const result = await service.runManualWorkflow(
        mockUserId,
        mockWorkflowId,
        { orderType: 'express', orderId: 'ORD-123' },
      );

      expect(result.status).toBe(ExecutionStatus.success);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.executionNodeLog.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('Complete Workflow Chain: Complex Conditional Logic', () => {
    it('should execute: trigger -> if (multiple conditions) -> code -> transform', async () => {
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
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-2',
          workflowId: mockWorkflowId,
          typeCode: 'if',
          label: 'Validate User',
          posX: 100,
          posY: 0,
          configJson: {
            mode: 'all',
            conditions: [
              {
                left: '{{input.age}}',
                operator: 'gte',
                right: 18,
              },
              {
                left: '{{input.verified}}',
                operator: 'equals',
                right: true,
              },
            ],
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-3',
          workflowId: mockWorkflowId,
          typeCode: 'code',
          label: 'Calculate Score',
          posX: 200,
          posY: 0,
          configJson: {
            source: `
              const baseScore = 100;
              const ageBonus = Math.min(input.age - 18, 50);
              const verifiedBonus = input.verified ? 50 : 0;
              return {
                ...input,
                score: baseScore + ageBonus + verifiedBonus,
                tier: baseScore + ageBonus + verifiedBonus >= 150 ? 'premium' : 'standard'
              };
            `,
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-4',
          workflowId: mockWorkflowId,
          typeCode: 'transform',
          label: 'Format Output',
          posX: 300,
          posY: 0,
          configJson: {
            script: `
              return {
                userId: input.userId,
                tier: input.tier,
                score: input.score,
                timestamp: new Date().toISOString()
              };
            `,
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
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
        {
          id: 'edge-2',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-2',
          targetNodeId: 'node-3',
          sourceHandle: 'true',
          targetHandle: null,
          conditionType: 'true',
          label: 'true',
          createdAt: new Date(),
        },
        {
          id: 'edge-3',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-3',
          targetNodeId: 'node-4',
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
        name: 'Complex Conditional Logic',
        nodes,
        edges,
        project: {
          ownerId: mockUserId,
          members: [],
        },
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockWorkflow as any,
      );
      (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        workflowId: mockWorkflowId,
        status: ExecutionStatus.running,
        startedAt: new Date(),
      });
      (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
        id: 'log-1',
        executionId: mockExecutionId,
        status: NodeExecutionStatus.running,
      });
      (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({});
      (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        status: ExecutionStatus.success,
      });

      const result = await service.runManualWorkflow(
        mockUserId,
        mockWorkflowId,
        { userId: 'user-789', age: 25, verified: true },
      );

      expect(result.status).toBe(ExecutionStatus.success);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.executionNodeLog.create).toHaveBeenCalledTimes(4);
    });
  });

  describe('Complete Workflow Chain: HTTP Integration', () => {
    it('should execute: trigger -> http_request -> transform -> set', async () => {
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
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-2',
          workflowId: mockWorkflowId,
          typeCode: 'http_request',
          label: 'Fetch User Data',
          posX: 100,
          posY: 0,
          configJson: {
            url: 'https://jsonplaceholder.typicode.com/users/1',
            method: 'GET',
            headers: {},
            query: {},
            timeout: 10000,
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-3',
          workflowId: mockWorkflowId,
          typeCode: 'transform',
          label: 'Extract Data',
          posX: 200,
          posY: 0,
          configJson: {
            script: `
              return {
                userId: input.body.id,
                userName: input.body.name,
                userEmail: input.body.email,
                statusCode: input.status
              };
            `,
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-4',
          workflowId: mockWorkflowId,
          typeCode: 'set',
          label: 'Add Metadata',
          posX: 300,
          posY: 0,
          configJson: {
            values: {
              processed: true,
              source: 'api',
            },
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
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
        {
          id: 'edge-2',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-2',
          targetNodeId: 'node-3',
          sourceHandle: null,
          targetHandle: null,
          conditionType: null,
          label: null,
          createdAt: new Date(),
        },
        {
          id: 'edge-3',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-3',
          targetNodeId: 'node-4',
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
        name: 'HTTP Integration',
        nodes,
        edges,
        project: {
          ownerId: mockUserId,
          members: [],
        },
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockWorkflow as any,
      );
      (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        workflowId: mockWorkflowId,
        status: ExecutionStatus.running,
        startedAt: new Date(),
      });
      (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
        id: 'log-1',
        executionId: mockExecutionId,
        status: NodeExecutionStatus.running,
      });
      (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({});
      (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        status: ExecutionStatus.success,
      });

      const result = await service.runManualWorkflow(
        mockUserId,
        mockWorkflowId,
        {},
      );

      expect(result.status).toBe(ExecutionStatus.success);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.executionNodeLog.create).toHaveBeenCalled();
      expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        prisma.executionNodeLog.create.mock.calls.length,
      ).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Complete Workflow Chain: Delay and Timing', () => {
    it('should execute: trigger -> delay -> set -> delay -> transform', async () => {
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
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-2',
          workflowId: mockWorkflowId,
          typeCode: 'delay',
          label: 'Wait 100ms',
          posX: 100,
          posY: 0,
          configJson: {
            durationMs: 100,
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-3',
          workflowId: mockWorkflowId,
          typeCode: 'set',
          label: 'Add Timestamp',
          posX: 200,
          posY: 0,
          configJson: {
            values: {
              step1Complete: true,
            },
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-4',
          workflowId: mockWorkflowId,
          typeCode: 'delay',
          label: 'Wait 100ms',
          posX: 300,
          posY: 0,
          configJson: {
            durationMs: 100,
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
        },
        {
          id: 'node-5',
          workflowId: mockWorkflowId,
          typeCode: 'transform',
          label: 'Final Transform',
          posX: 400,
          posY: 0,
          configJson: {
            script: 'return { ...input, completed: true };',
          },
          isDisabled: false,
          createdAt: new Date(),
          name: null,
          nodeTypeId: null,
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
        {
          id: 'edge-2',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-2',
          targetNodeId: 'node-3',
          sourceHandle: null,
          targetHandle: null,
          conditionType: null,
          label: null,
          createdAt: new Date(),
        },
        {
          id: 'edge-3',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-3',
          targetNodeId: 'node-4',
          sourceHandle: null,
          targetHandle: null,
          conditionType: null,
          label: null,
          createdAt: new Date(),
        },
        {
          id: 'edge-4',
          workflowId: mockWorkflowId,
          sourceNodeId: 'node-4',
          targetNodeId: 'node-5',
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
        name: 'Delay and Timing',
        nodes,
        edges,
        project: {
          ownerId: mockUserId,
          members: [],
        },
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockWorkflow as any,
      );
      (prisma.workflowExecution.create as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        workflowId: mockWorkflowId,
        status: ExecutionStatus.running,
        startedAt: new Date(),
      });
      (prisma.executionNodeLog.create as jest.Mock).mockResolvedValue({
        id: 'log-1',
        executionId: mockExecutionId,
        status: NodeExecutionStatus.running,
      });
      (prisma.executionNodeLog.update as jest.Mock).mockResolvedValue({});
      (prisma.workflowExecution.update as jest.Mock).mockResolvedValue({
        id: mockExecutionId,
        status: ExecutionStatus.success,
      });

      const startTime = Date.now();
      const result = await service.runManualWorkflow(
        mockUserId,
        mockWorkflowId,
        { taskId: 'task-123' },
      );
      const endTime = Date.now();

      expect(result.status).toBe(ExecutionStatus.success);
      expect(endTime - startTime).toBeGreaterThanOrEqual(200);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.executionNodeLog.create).toHaveBeenCalledTimes(5);
    });
  });
});
