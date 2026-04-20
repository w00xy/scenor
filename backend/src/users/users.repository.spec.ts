import { ProjectMemberRole, ProjectType, Role, User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prisma: jest.Mocked<Pick<DatabaseService, '$transaction'>>;

  const createUserEntity = (overrides: Partial<User> = {}): User => ({
    id: 'cc0845f6-ecfb-4ab4-8218-0745d7b5a065',
    username: 'Alex',
    email: 'alex@example.com',
    passwordHash: 'hashed-password',
    role: Role.USER,
    createdAt: new Date('2026-04-20T10:00:00.000Z'),
    updatedAt: new Date('2026-04-20T10:00:00.000Z'),
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
    };
    repository = new UsersRepository(prisma as unknown as DatabaseService);
  });

  it('creates user, personal project and owner membership in one transaction', async () => {
    const createdUser = createUserEntity();
    const tx = {
      user: {
        create: jest.fn().mockResolvedValue(createdUser),
      },
      project: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: '0af9889d-d6ce-4e3c-b9ca-22728f450f6e',
        }),
      },
      projectMember: {
        upsert: jest.fn().mockResolvedValue({
          id: 'f9c7fdbb-621f-42e9-a910-e56a688f3f8d',
        }),
      },
    };

    prisma.$transaction.mockImplementation(async (callback) => callback(tx as any));

    const result = await repository.create({
      username: createdUser.username!,
      email: createdUser.email,
      password: 'hash',
    });

    expect(tx.user.create).toHaveBeenCalledWith({
      data: {
        username: createdUser.username,
        email: createdUser.email,
        passwordHash: 'hash',
      },
    });
    expect(tx.project.findFirst).toHaveBeenCalledWith({
      where: {
        ownerId: createdUser.id,
        type: ProjectType.PERSONAL,
      },
      select: {
        id: true,
      },
    });
    expect(tx.project.create).toHaveBeenCalledWith({
      data: {
        ownerId: createdUser.id,
        type: ProjectType.PERSONAL,
        name: 'Personal',
        description: 'Default personal project',
      },
      select: {
        id: true,
      },
    });
    expect(tx.projectMember.upsert).toHaveBeenCalledWith({
      where: {
        projectId_userId: {
          projectId: '0af9889d-d6ce-4e3c-b9ca-22728f450f6e',
          userId: createdUser.id,
        },
      },
      create: {
        projectId: '0af9889d-d6ce-4e3c-b9ca-22728f450f6e',
        userId: createdUser.id,
        role: ProjectMemberRole.OWNER,
      },
      update: {
        role: ProjectMemberRole.OWNER,
      },
    });
    expect(result).toEqual(createdUser);
  });

  it('does not create duplicate personal project for the same user', async () => {
    const createdUser = createUserEntity();
    const existingProject = {
      id: 'fd42de14-b45e-4368-b5cb-0ea3b8deef99',
    };
    const tx = {
      user: {
        create: jest.fn().mockResolvedValue(createdUser),
      },
      project: {
        findFirst: jest.fn().mockResolvedValue(existingProject),
        create: jest.fn(),
      },
      projectMember: {
        upsert: jest.fn().mockResolvedValue({
          id: '2f1c31e8-e930-4475-a9de-51b42baa2780',
        }),
      },
    };

    prisma.$transaction.mockImplementation(async (callback) => callback(tx as any));

    await repository.create({
      username: createdUser.username!,
      email: createdUser.email,
      password: 'hash',
    });

    expect(tx.project.create).not.toHaveBeenCalled();
    expect(tx.projectMember.upsert).toHaveBeenCalledWith({
      where: {
        projectId_userId: {
          projectId: existingProject.id,
          userId: createdUser.id,
        },
      },
      create: {
        projectId: existingProject.id,
        userId: createdUser.id,
        role: ProjectMemberRole.OWNER,
      },
      update: {
        role: ProjectMemberRole.OWNER,
      },
    });
  });

  it('rolls back registration when project membership creation fails', async () => {
    const createdUser = createUserEntity();
    const persistedState = {
      users: 0,
      projects: 0,
      memberships: 0,
    };

    prisma.$transaction.mockImplementation(async (callback) => {
      const stagedState = {
        users: persistedState.users,
        projects: persistedState.projects,
        memberships: persistedState.memberships,
      };

      const tx = {
        user: {
          create: jest.fn().mockImplementation(async () => {
            stagedState.users += 1;
            return createdUser;
          }),
        },
        project: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockImplementation(async () => {
            stagedState.projects += 1;
            return {
              id: '4f9de1aa-8b24-43de-aeec-0d0e398e3e5b',
            };
          }),
        },
        projectMember: {
          upsert: jest.fn().mockImplementation(async () => {
            throw new Error('membership create failed');
          }),
        },
      };

      try {
        const result = await callback(tx as any);
        persistedState.users = stagedState.users;
        persistedState.projects = stagedState.projects;
        persistedState.memberships = stagedState.memberships;
        return result;
      } catch (error) {
        throw error;
      }
    });

    await expect(
      repository.create({
        username: createdUser.username!,
        email: createdUser.email,
        password: 'hash',
      }),
    ).rejects.toThrow('membership create failed');

    expect(persistedState.users).toBe(0);
    expect(persistedState.projects).toBe(0);
    expect(persistedState.memberships).toBe(0);
  });
});
