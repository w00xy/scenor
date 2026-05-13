import { Test, TestingModule } from '@nestjs/testing';
import { AdminWorkflowsController } from './admin-workflows.controller';
import { AdminWorkflowsService } from '../services/admin-workflows.service';

describe('AdminWorkflowsController', () => {
  let controller: AdminWorkflowsController;
  let service: AdminWorkflowsService;

  const mockAdminWorkflowsService = {
    getAllWorkflows: jest.fn(),
    getWorkflowById: jest.fn(),
    deleteWorkflow: jest.fn(),
    getWorkflowStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminWorkflowsController],
      providers: [
        {
          provide: AdminWorkflowsService,
          useValue: mockAdminWorkflowsService,
        },
      ],
    }).compile();

    controller = module.get<AdminWorkflowsController>(AdminWorkflowsController);
    service = module.get<AdminWorkflowsService>(AdminWorkflowsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllWorkflows', () => {
    it('should return all workflows', async () => {
      const result = { workflows: [], total: 0 };
      mockAdminWorkflowsService.getAllWorkflows.mockResolvedValue(result);

      expect(await controller.getAllWorkflows({})).toBe(result);
    });
  });

  describe('getWorkflowById', () => {
    it('should return a workflow by id', async () => {
      const workflow = { id: '1', name: 'Test Workflow' };
      mockAdminWorkflowsService.getWorkflowById.mockResolvedValue(workflow);

      expect(await controller.getWorkflowById('1')).toBe(workflow);
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete a workflow', async () => {
      const result = { message: 'Workflow deleted successfully' };
      mockAdminWorkflowsService.deleteWorkflow.mockResolvedValue(result);

      const req = {
        user: { sub: 'admin-id' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      };

      expect(await controller.deleteWorkflow('1', req)).toBe(result);
    });
  });

  describe('getWorkflowStatistics', () => {
    it('should return workflow statistics', async () => {
      const stats = {
        nodesCount: 5,
        edgesCount: 4,
        executionsCount: 10,
      };
      mockAdminWorkflowsService.getWorkflowStatistics.mockResolvedValue(stats);

      expect(await controller.getWorkflowStatistics('1')).toBe(stats);
    });
  });
});
