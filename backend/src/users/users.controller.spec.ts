import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role, User } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuthTokenService } from '../auth/auth-token.service';
import { Reflector } from '@nestjs/core';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const createPublicUser = (
    overrides: Partial<Omit<User, 'passwordHash'>> = {},
  ): Omit<User, 'passwordHash'> => ({
    id: '887bf626-1702-41f9-a6ef-20f63e3ec9bc',
    username: 'Alex',
    email: 'alex@example.com',
    role: Role.USER,
    createdAt: new Date('2026-01-10T10:00:00.000Z'),
    updatedAt: new Date('2026-01-10T10:00:00.000Z'),
    ...overrides,
  });

  beforeEach(async () => {
    const usersServiceMock = {
      createUser: jest.fn(),
      loginUser: jest.fn(),
      refreshTokens: jest.fn(),
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: AuthTokenService,
          useValue: {
            verifyAccessToken: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn().mockReturnValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register should call usersService.createUser and return result', async () => {
    const response = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: createPublicUser(),
    };
    const data = {
      name: 'Alex',
      email: 'alex@example.com',
      password: 'strongpass123',
    };

    usersService.createUser.mockResolvedValue(response);

    const result = await controller.register(data);

    expect(usersService.createUser).toHaveBeenCalledWith(data);
    expect(result).toEqual(response);
  });

  it('login should call usersService.loginUser and return result', async () => {
    const response = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: createPublicUser(),
    };
    const data = {
      username: 'Alex',
      password: 'strongpass123',
    };

    usersService.loginUser.mockResolvedValue(response);

    const result = await controller.login(data);

    expect(usersService.loginUser).toHaveBeenCalledWith(data);
    expect(result).toEqual(response);
  });

  it('refresh should call usersService.refreshTokens with refreshToken from body', async () => {
    const response = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    usersService.refreshTokens.mockResolvedValue(response);

    const result = await controller.refresh({ refreshToken: 'token-1' });

    expect(usersService.refreshTokens).toHaveBeenCalledWith('token-1');
    expect(result).toEqual(response);
  });

  it('getAllUsers should pass pagination params to service', async () => {
    const response = [
      createPublicUser(),
      createPublicUser({
        id: 'f39dd5de-6876-4f7e-9831-abdaf0a9f2d7',
        username: 'Maria',
        email: 'maria@example.com',
      }),
    ];
    usersService.getAllUsers.mockResolvedValue(response);

    const result = await controller.getAllUsers(20, 5);

    expect(usersService.getAllUsers).toHaveBeenCalledWith(20, 5);
    expect(result).toEqual(response);
  });

  it('getUserById should call usersService.getUserById', async () => {
    const response = createPublicUser();
    usersService.getUserById.mockResolvedValue(response);

    const result = await controller.getUserById(response.id);

    expect(usersService.getUserById).toHaveBeenCalledWith(response.id);
    expect(result).toEqual(response);
  });

  it('updateUser should call usersService.updateUser with id and dto', async () => {
    const response = createPublicUser({
      username: 'Alex Updated',
      email: 'alex.updated@example.com',
    });
    const id = '59c22156-6f13-495d-9b8a-8f47eec7d74c';
    const data = {
      name: 'Alex Updated',
      email: 'alex.updated@example.com',
      password: 'newpass123',
    };

    usersService.updateUser.mockResolvedValue(response);

    const result = await controller.updateUser(id, data);

    expect(usersService.updateUser).toHaveBeenCalledWith(id, data);
    expect(result).toEqual(response);
  });

  it('deleteUser should call usersService.deleteUser', async () => {
    const response = createPublicUser();
    usersService.deleteUser.mockResolvedValue(response);

    const result = await controller.deleteUser(response.id);

    expect(usersService.deleteUser).toHaveBeenCalledWith(response.id);
    expect(result).toEqual(response);
  });
});
