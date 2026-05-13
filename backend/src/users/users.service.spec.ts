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
    const { passwordHash, role, ...publicUser } = user;
    return {
      ...publicUser,
      globalRole: role,
    };
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




});
