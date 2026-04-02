import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { UsersUtils } from './users.utils.js';
import { Prisma, User } from '@prisma/client';
import { CreateUserDto } from './dto/users-create.dto.js';
import { LoginUserDto } from './dto/users-login.dto.js';
import { UpdateUserDto } from './dto/users-update.dto.js';
import { AuthTokenService } from '../auth/auth-token.service.js';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private usersUtils: UsersUtils,
    private authTokenService: AuthTokenService,
  ) {}

  async createUser(data: CreateUserDto) {
    const missingFields: string[] = [];
    if (!data?.name?.trim()) {
      missingFields.push('name');
    }
    if (!data?.email?.trim()) {
      missingFields.push('email');
    }
    if (!data?.password?.trim()) {
      missingFields.push('password');
    }

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}`,
      );
    }

    const normalizedName = data.name.trim();
    const normalizedEmail = data.email.trim().toLowerCase();

    const [existingByEmail, existingByUsername] = await Promise.all([
      this.usersRepository.findByEmail(normalizedEmail),
      this.usersRepository.findByUsername(normalizedName),
    ]);

    if (existingByEmail) {
      throw new ConflictException('User with this email already exists');
    }
    if (existingByUsername) {
      throw new ConflictException('User with this username already exists');
    }

    const passwordHash = await this.usersUtils.hashPassword(data.password);

    const newData = {
      name: normalizedName,
      email: normalizedEmail,
      password: passwordHash,
    };

    try {
      const user = await this.usersRepository.create(newData);
      const tokens = await this.authTokenService.generateTokens(
      user.id,
      user.role,
    );
      return {
        ...tokens,
        user: this.toPublicUser(user)
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  async loginUser(data: LoginUserDto) {
    const username = data.username?.trim();
    const email = data.email?.trim().toLowerCase();
    const password = data.password?.trim();

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    if (!username && !email) {
      throw new BadRequestException('Provide username or email');
    }

    const user = username
      ? await this.usersRepository.findByUsername(username)
      : await this.usersRepository.findByEmail(email!);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordCorrect = await this.usersUtils.comparePassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.authTokenService.generateTokens(
      user.id,
      user.role,
    );

    return {
      ...tokens,
      user: this.toPublicUser(user),
    };
  }

  async refreshTokens(refreshToken: string) {
    const token = refreshToken?.trim();
    if (!token) {
      throw new BadRequestException('Refresh token is required');
    }

    const payload = await this.authTokenService.verifyRefreshToken(token);
    const user = await this.usersRepository.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.authTokenService.generateTokens(user.id, user.role);
  }

  async getAllUsers(limit = 100, offset = 0) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException(
        'limit must be an integer between 1 and 100',
      );
    }
    if (!Number.isInteger(offset) || offset < 0) {
      throw new BadRequestException(
        'offset must be an integer greater than or equal to 0',
      );
    }

    const users = await this.usersRepository.findAll(limit, offset);
    return users.map((user) => this.toPublicUser(user));
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const existingUser = await this.usersRepository.findOne(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const normalizedName = data.name?.trim();
    const normalizedEmail = data.email?.trim().toLowerCase();

    if (normalizedName) {
      const userWithSameUsername =
        await this.usersRepository.findByUsername(normalizedName);
      if (userWithSameUsername && userWithSameUsername.id !== id) {
        throw new ConflictException('User with this username already exists');
      }
    }

    if (normalizedEmail) {
      const userWithSameEmail =
        await this.usersRepository.findByEmail(normalizedEmail);
      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (data.password) {
      const passwordHash = await this.usersUtils.hashPassword(data.password);

      data = {
        ...data,
        password: passwordHash,
      };
    }

    try {
      const updatedUser = await this.usersRepository.update(id, {
        ...data,
        ...(normalizedName ? { name: normalizedName } : {}),
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
      });
      return this.toPublicUser(updatedUser);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  async deleteUser(id: string) {
    const existingUser = await this.usersRepository.findOne(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.usersRepository.delete(id);
    return this.toPublicUser(deletedUser);
  }

  private toPublicUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
