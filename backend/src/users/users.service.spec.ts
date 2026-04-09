import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersUtils } from './users.utils';
import { AuthTokenService } from '../auth/auth-token.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let usersUtils: jest.Mocked<UsersUtils>;
  let authTokenService: jest.Mocked<AuthTokenService>;

  const createUserEntity = (overrides: Partial<User> = {}): User => ({
    id: 'bf046bee-f2df-40a7-83bc-4bcf4e8d7dc5',
    username: 'Alex',
    email: 'alex@example.com',
    passwordHash: 'hashed-password',
    role: Role.USER,
    createdAt: new Date('2026-01-10T10:00:00.000Z'),
    updatedAt: new Date('2026-01-10T10:00:00.000Z'),
    ...overrides,
  });

  const toPublicUser = (user: User) => {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  };

  beforeEach(async () => {
    const usersRepositoryMock = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const usersUtilsMock = {
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    };

    const authTokenServiceMock = {
      generateTokens: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
        },
        {
          provide: UsersUtils,
          useValue: usersUtilsMock,
        },
        {
          provide: AuthTokenService,
          useValue: authTokenServiceMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(
      UsersRepository,
    ) as jest.Mocked<UsersRepository>;
    usersUtils = module.get(UsersUtils) as jest.Mocked<UsersUtils>;
    authTokenService = module.get(
      AuthTokenService,
    ) as jest.Mocked<AuthTokenService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create user, normalize fields and return tokens with public user', async () => {
      const createdUser = createUserEntity({
        username: 'Alex',
        email: 'alex@example.com',
        passwordHash: 'new-hash',
      });
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.findByUsername.mockResolvedValue(null);
      usersUtils.hashPassword.mockResolvedValue('new-hash');
      usersRepository.create.mockResolvedValue(createdUser);
      authTokenService.generateTokens.mockResolvedValue(tokens);

      const result = await service.createUser({
        username: '  Alex  ',
        email: '  ALEX@EXAMPLE.COM  ',
        password: 'strongpass123',
      });

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        'alex@example.com',
      );
      expect(usersRepository.findByUsername).toHaveBeenCalledWith('Alex');
      expect(usersRepository.create).toHaveBeenCalledWith({
        username: 'Alex',
        email: 'alex@example.com',
        password: 'new-hash',
      });
      expect(authTokenService.generateTokens).toHaveBeenCalledWith(
        createdUser.id,
        createdUser.role,
      );
      expect(result).toEqual({
        ...tokens,
        user: toPublicUser(createdUser),
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      await expect(
        service.createUser({
          username: ' ',
          email: '',
          password: ' ',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createUser({
          username: ' ',
          email: '',
          password: ' ',
        }),
      ).rejects.toThrow('Missing required fields: username, email, password');
    });

    it('should throw ConflictException when user with same email exists', async () => {
      usersRepository.findByEmail.mockResolvedValue(createUserEntity());
      usersRepository.findByUsername.mockResolvedValue(null);

      await expect(
        service.createUser({
          username: 'Alex',
          email: 'alex@example.com',
          password: 'strongpass123',
        }),
      ).rejects.toThrow(ConflictException);
      expect(usersUtils.hashPassword).not.toHaveBeenCalled();
      expect(usersRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should login by email and return tokens with public user', async () => {
      const user = createUserEntity();
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      usersRepository.findByEmail.mockResolvedValue(user);
      usersUtils.comparePassword.mockResolvedValue(true);
      authTokenService.generateTokens.mockResolvedValue(tokens);

      const result = await service.loginUser({
        email: '  ALEX@EXAMPLE.COM  ',
        password: 'strongpass123',
      });

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        'alex@example.com',
      );
      expect(usersUtils.comparePassword).toHaveBeenCalledWith(
        'strongpass123',
        user.passwordHash,
      );
      expect(authTokenService.generateTokens).toHaveBeenCalledWith(
        user.id,
        user.role,
      );
      expect(result).toEqual({
        ...tokens,
        user: toPublicUser(user),
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw BadRequestException when password is missing', async () => {
      await expect(
        service.loginUser({
          email: 'alex@example.com',
          password: ' ',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.loginUser({
          email: 'alex@example.com',
          password: ' ',
        }),
      ).rejects.toThrow('Password is required');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      usersRepository.findByUsername.mockResolvedValue(createUserEntity());
      usersUtils.comparePassword.mockResolvedValue(false);

      await expect(
        service.loginUser({
          username: 'Alex',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should verify refresh token and return new pair', async () => {
      const user = createUserEntity();
      const tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authTokenService.verifyRefreshToken.mockResolvedValue({
        sub: user.id,
        role: user.role,
      });
      usersRepository.findOne.mockResolvedValue(user);
      authTokenService.generateTokens.mockResolvedValue(tokens);

      const result = await service.refreshTokens('  valid-refresh-token  ');

      expect(authTokenService.verifyRefreshToken).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(usersRepository.findOne).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(tokens);
    });

    it('should throw BadRequestException when refresh token is empty', async () => {
      await expect(service.refreshTokens(' ')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.refreshTokens(' ')).rejects.toThrow(
        'Refresh token is required',
      );
    });

    it('should throw UnauthorizedException when token payload references missing user', async () => {
      authTokenService.verifyRefreshToken.mockResolvedValue({
        sub: '4a6f2609-fc15-4060-8b17-8556be22008b',
        role: Role.USER,
      });
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshTokens('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return public users list', async () => {
      const firstUser = createUserEntity();
      const secondUser = createUserEntity({
        id: '5f6428ba-95dd-4f7b-b5bc-c1e874acff77',
        username: 'Maria',
        email: 'maria@example.com',
      });

      usersRepository.findAll.mockResolvedValue([firstUser, secondUser]);

      const result = await service.getAllUsers(2, 0);

      expect(usersRepository.findAll).toHaveBeenCalledWith(2, 0);
      expect(result).toEqual([
        toPublicUser(firstUser),
        toPublicUser(secondUser),
      ]);
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[1]).not.toHaveProperty('passwordHash');
    });

    it('should throw BadRequestException for invalid limit', async () => {
      await expect(service.getAllUsers(0, 0)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getAllUsers(0, 0)).rejects.toThrow(
        'limit must be an integer between 1 and 100',
      );
    });
  });

  describe('getUserById', () => {
    it('should return public user', async () => {
      const user = createUserEntity();
      usersRepository.findOne.mockResolvedValue(user);

      const result = await service.getUserById(user.id);

      expect(usersRepository.findOne).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(toPublicUser(user));
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getUserById('c5086a2d-a2b8-4f93-bbbf-086d13ebdd4a'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update user with normalized data and hashed password', async () => {
      const user = createUserEntity();
      const updatedUser = createUserEntity({
        username: 'Alex Updated',
        email: 'alex.updated@example.com',
        passwordHash: 'updated-hash',
      });

      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.findByUsername.mockResolvedValue(null);
      usersRepository.findByEmail.mockResolvedValue(null);
      usersUtils.hashPassword.mockResolvedValue('updated-hash');
      usersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser({
        id: user.id,
        username: '  Alex Updated  ',
        email: '  ALEX.UPDATED@EXAMPLE.COM  ',
        password: 'newstrongpass123',
      });

      expect(usersRepository.findByUsername).toHaveBeenCalledWith(
        'Alex Updated',
      );
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        'alex.updated@example.com',
      );
      expect(usersRepository.update).toHaveBeenCalledWith(user.id, {
        id: user.id,
        username: 'Alex Updated',
        email: 'alex.updated@example.com',
        password: 'updated-hash',
      });
      expect(result).toEqual(toPublicUser(updatedUser));
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException when user to update does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUser({
          id: '9389f503-ba78-479e-9b7b-9f6755af20d3',
          username: 'New Name',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return public user', async () => {
      const user = createUserEntity();
      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.delete.mockResolvedValue(user);

      const result = await service.deleteUser(user.id);

      expect(usersRepository.findOne).toHaveBeenCalledWith(user.id);
      expect(usersRepository.delete).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(toPublicUser(user));
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException when deleting unknown user', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteUser('f8eb17aa-c986-4309-9f20-4f658ec859d0'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
