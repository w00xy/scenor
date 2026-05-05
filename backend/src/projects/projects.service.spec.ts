import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { DatabaseService } from '../database/database.service';
import { ProjectMemberRole, Role } from '@prisma/client';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: jest.Mocked<DatabaseService>;

  const mockUserId = 'user-123';
  const mockProjectId = 'project-123';

  beforeEach(async () => {
    const prismaMock = {
      project: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      projectMember: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: DatabaseService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProject', () => {
    it('should create a project with owner membership', async () => {
      const mockProject = {
        id: mockProjectId,
        name: 'Test Project',
        description: 'Test Description',
        ownerId: mockUserId,
        type: 'TEAM',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTx = {
        project: {
          create: jest.fn().mockResolvedValue(mockProject),
        },
        projectMember: {
          create: jest.fn().mockResolvedValue({
            projectId: mockProjectId,
            userId: mockUserId,
            role: ProjectMemberRole.OWNER,
          }),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await service.createProject(mockUserId, {
        name: 'Test Project',
        description: 'Test Description',
      });

      expect(result).toEqual(mockProject);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('listUserProjects', () => {
    it('should list all projects for a user', async () => {
      const mockProjects = [
        {
          id: mockProjectId,
          name: 'Test Project',
          description: 'Test Description',
          ownerId: mockUserId,
          type: 'TEAM',
          createdAt: new Date(),
          updatedAt: new Date(),
          members: [{ role: ProjectMemberRole.OWNER }],
        },
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await service.getMyProjects(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(mockProjectId);
      expect(result[0].accessRole).toEqual(ProjectMemberRole.OWNER);
      expect(prisma.project.findMany).toHaveBeenCalled();
    });
  });

  describe('getProjectById', () => {
    it('should get a project by id if user has access', async () => {
      const mockProject = {
        id: mockProjectId,
        name: 'Test Project',
        description: 'Test Description',
        ownerId: mockUserId,
        type: 'TEAM',
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await service.getProjectById(mockUserId, mockProjectId);

      expect(result).toEqual(mockProject);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: mockProjectId },
        include: expect.any(Object),
      });
    });
  });
});
