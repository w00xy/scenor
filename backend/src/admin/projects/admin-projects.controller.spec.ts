import { Test, TestingModule } from '@nestjs/testing';
import { AdminProjectsController } from './admin-projects.controller';
import { AdminProjectsService } from '../services/admin-projects.service';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../../auth/auth.guard.js';

describe('AdminProjectsController', () => {
  let controller: AdminProjectsController;
  let service: jest.Mocked<AdminProjectsService>;

  const mockAdminProjectsService = {
    getAllProjects: jest.fn(),
    getProjectById: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
    transferOwnership: jest.fn(),
    getProjectStatistics: jest.fn(),
  };

  const mockRequest = {
    user: { sub: 'admin-id-123', role: 'SUPER_ADMIN' },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProjectsController],
      providers: [
        {
          provide: AdminProjectsService,
          useValue: mockAdminProjectsService,
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

    controller = module.get<AdminProjectsController>(AdminProjectsController);
    service = module.get(AdminProjectsService) as jest.Mocked<AdminProjectsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllProjects', () => {
    it('should return paginated projects list', async () => {
      const query = { limit: 10, offset: 0 };
      const mockResult = {
        projects: [
          {
            id: 'project-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'Test Project',
            ownerId: 'user-1',
            description: 'Test description',
            type: 'PERSONAL' as const,
            isArchived: false,
            _count: {
              members: 0,
              workflows: 0,
            },
            owner: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
            },
          },
        ],
        total: 1,
      };

      service.getAllProjects.mockResolvedValue(mockResult);

      const result = await controller.getAllProjects(query);

      expect(service.getAllProjects).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should filter projects by search term', async () => {
      const query = { search: 'test', limit: 50, offset: 0 };
      const mockResult = { projects: [], total: 0 };

      service.getAllProjects.mockResolvedValue(mockResult);

      await controller.getAllProjects(query);

      expect(service.getAllProjects).toHaveBeenCalledWith(query);
    });

    it('should filter projects by type', async () => {
      const query = { type: 'TEAM', limit: 50, offset: 0 };
      const mockResult = { projects: [], total: 0 };

      service.getAllProjects.mockResolvedValue(mockResult);

      await controller.getAllProjects(query);

      expect(service.getAllProjects).toHaveBeenCalledWith(query);
    });

    it('should filter projects by archived status', async () => {
      const query = { isArchived: true, limit: 50, offset: 0 };
      const mockResult = { projects: [], total: 0 };

      service.getAllProjects.mockResolvedValue(mockResult);

      await controller.getAllProjects(query);

      expect(service.getAllProjects).toHaveBeenCalledWith(query);
    });

    it('should filter projects by owner id', async () => {
      const query = { ownerId: 'user-123', limit: 50, offset: 0 };
      const mockResult = { projects: [], total: 0 };

      service.getAllProjects.mockResolvedValue(mockResult);

      await controller.getAllProjects(query);

      expect(service.getAllProjects).toHaveBeenCalledWith(query);
    });
  });

  describe('getProjectById', () => {
    it('should return project by id', async () => {
      const projectId = 'project-123';
      const mockProject = {
        id: projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Test Project',
        ownerId: 'user-1',
        description: 'Test description',
        type: 'PERSONAL' as const,
        isArchived: false,
        _count: {
          credentials: 0,
          workflows: 0,
        },
        owner: {
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com',
        },
        members: [],
        workflows: [],
      };

      service.getProjectById.mockResolvedValue(mockProject);

      const result = await controller.getProjectById(projectId);

      expect(service.getProjectById).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(mockProject);
    });
  });

  describe('updateProject', () => {
    it('should update project details', async () => {
      const projectId = 'project-123';
      const updateDto = { name: 'Updated Project', description: 'Updated description' };
      const mockUpdatedProject = {
        id: projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Updated Project',
        ownerId: 'user-1',
        description: 'Updated description',
        type: 'PERSONAL' as const,
        isArchived: false,
      };

      service.updateProject.mockResolvedValue(mockUpdatedProject);

      const result = await controller.updateProject(projectId, updateDto, mockRequest);

      expect(service.updateProject).toHaveBeenCalledWith(
        projectId,
        updateDto,
        'admin-id-123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockUpdatedProject);
    });

    it('should archive a project', async () => {
      const projectId = 'project-123';
      const updateDto = { isArchived: true };
      const mockUpdatedProject = {
        id: projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Test Project',
        ownerId: 'user-1',
        description: null,
        type: 'PERSONAL' as const,
        isArchived: true,
      };

      service.updateProject.mockResolvedValue(mockUpdatedProject);

      const result = await controller.updateProject(projectId, updateDto, mockRequest);

      expect(service.updateProject).toHaveBeenCalledWith(
        projectId,
        updateDto,
        'admin-id-123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockUpdatedProject);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const projectId = 'project-123';
      const mockResponse = { message: 'Project deleted successfully' };

      service.deleteProject.mockResolvedValue(mockResponse);

      const result = await controller.deleteProject(projectId, mockRequest);

      expect(service.deleteProject).toHaveBeenCalledWith(
        projectId,
        'admin-id-123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('transferOwnership', () => {
    it('should transfer project ownership', async () => {
      const projectId = 'project-123';
      const transferDto = { newOwnerId: 'user-456' };
      const mockUpdatedProject = {
        id: projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Test Project',
        ownerId: 'user-456',
        description: null,
        type: 'PERSONAL' as const,
        isArchived: false,
      };

      service.transferOwnership.mockResolvedValue(mockUpdatedProject);

      const result = await controller.transferOwnership(projectId, transferDto, mockRequest);

      expect(service.transferOwnership).toHaveBeenCalledWith(
        projectId,
        'user-456',
        'admin-id-123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockUpdatedProject);
    });
  });

  describe('getProjectStatistics', () => {
    it('should return project statistics', async () => {
      const projectId = 'project-123';
      const mockStatistics = {
        workflowsCount: 5,
        executionsCount: 100,
        credentialsCount: 3,
        membersCount: 2,
        executionsByStatus: [
          { status: 'success' as const, _count: 80 },
          { status: 'failed' as const, _count: 15 },
          { status: 'running' as const, _count: 5 },
        ],
      };

      service.getProjectStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getProjectStatistics(projectId);

      expect(service.getProjectStatistics).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(mockStatistics);
    });
  });
});