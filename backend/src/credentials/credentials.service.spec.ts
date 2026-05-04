import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CredentialsService } from './credentials.service';
import { DatabaseService } from '../database/database.service';
import { ProjectMemberRole } from '@prisma/client';

describe('CredentialsService', () => {
  let service: CredentialsService;
  let prisma: jest.Mocked<DatabaseService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUserId = 'user-123';
  const mockProjectId = 'project-123';
  const mockCredentialId = 'credential-123';

  beforeEach(async () => {
    const prismaMock = {
      project: {
        findUnique: jest.fn(),
      },
      credential: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const configServiceMock = {
      get: jest.fn().mockReturnValue('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        {
          provide: DatabaseService,
          useValue: prismaMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<CredentialsService>(CredentialsService);
    prisma = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCredential', () => {
    it('should create a credential with encrypted data', async () => {
      const mockProject = {
        id: mockProjectId,
        ownerId: mockUserId,
        members: [],
      };

      const mockCredential = {
        id: mockCredentialId,
        projectId: mockProjectId,
        type: 'api_key',
        name: 'My API Key',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.credential.create as jest.Mock).mockResolvedValue(mockCredential);

      const result = await service.createCredential(mockUserId, mockProjectId, {
        type: 'api_key',
        name: 'My API Key',
        data: { key: 'secret-key-123' },
      });

      expect(result).toEqual(mockCredential);
      expect(prisma.credential.create).toHaveBeenCalled();
    });
  });

  describe('listCredentialsByProject', () => {
    it('should list credentials for a project', async () => {
      const mockProject = {
        id: mockProjectId,
        ownerId: mockUserId,
        members: [],
      };

      const mockCredentials = [
        {
          id: 'cred-1',
          projectId: mockProjectId,
          type: 'api_key',
          name: 'API Key 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.credential.findMany as jest.Mock).mockResolvedValue(mockCredentials);

      const result = await service.listCredentialsByProject(mockUserId, mockProjectId);

      expect(result).toEqual(mockCredentials);
      expect(prisma.credential.findMany).toHaveBeenCalledWith({
        where: { projectId: mockProjectId },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
