import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { UsersUtils } from './users.utils.js';
import { Prisma, User, Role } from '@prisma/client';
import { CreateUserDto } from './dto/users-create.dto.js';
import { LoginUserDto } from './dto/users-login.dto.js';
import { UpdateUserDto } from './dto/users-update.dto.js';
import { ChangePasswordDto } from './dto/users-change-password.dto.js';
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
    if (!data?.username?.trim()) {
      missingFields.push('username');
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

    const normalizedUserName = data.username.trim();
    const normalizedEmail = data.email.trim().toLowerCase();

    const [existingByEmail, existingByUsername] = await Promise.all([
      this.usersRepository.findByEmail(normalizedEmail),
      this.usersRepository.findByUsername(normalizedUserName),
    ]);

    if (existingByEmail) {
      throw new ConflictException('User with this email already exists');
    }
    if (existingByUsername) {
      throw new ConflictException('User with this username already exists');
    }

    const passwordHash = await this.usersUtils.hashPassword(data.password);

    const newData = {
      username: normalizedUserName,
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
        user: this.toPublicUser(user),
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

    if (user.isBlocked) {
      throw new UnauthorizedException('Your account has been blocked. Please contact support.');
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

    if (user.isBlocked) {
      throw new UnauthorizedException('Your account has been blocked. Please contact support.');
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

  async updateUser(userId: string, data: UpdateUserDto) {
    const existingUser = await this.usersRepository.findOne(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const normalizedUserName = data.username?.trim();
    const normalizedEmail = data.email?.trim().toLowerCase();

    if (normalizedUserName) {
      const userWithSameUsername =
        await this.usersRepository.findByUsername(normalizedUserName);
      if (userWithSameUsername && userWithSameUsername.id !== userId) {
        throw new ConflictException('User with this username already exists');
      }
    }

    if (normalizedEmail) {
      const userWithSameEmail =
        await this.usersRepository.findByEmail(normalizedEmail);
      if (userWithSameEmail && userWithSameEmail.id !== userId) {
        throw new ConflictException('User with this email already exists');
      }
    }

    let updateData: UpdateUserDto = data;
    if (updateData.password) {
      const passwordHash = await this.usersUtils.hashPassword(updateData.password);

      updateData = {
        ...updateData,
        password: passwordHash,
      };
    }

    try {
      const updatedUser = await this.usersRepository.update(userId, {
        ...updateData,
        ...(normalizedUserName ? { username: normalizedUserName } : {}),
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

  async changePassword(userId: string, data: ChangePasswordDto) {
    const currentPassword = data.currentPassword?.trim();
    const newPassword = data.newPassword?.trim();

    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'Current password and new password are required',
      );
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const user = await this.usersRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await this.usersUtils.comparePassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await this.usersUtils.hashPassword(newPassword);
    await this.usersRepository.update(userId, { password: passwordHash });

    return { message: 'Password updated successfully' };
  }

  async checkPassword(userId: string, password: string) {
    const normalizedPassword = password?.trim();
    if (!normalizedPassword) {
      throw new BadRequestException('Password is required');
    }

    const user = await this.usersRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.usersUtils.comparePassword(
      normalizedPassword,
      user.passwordHash,
    );

    return { ok: isPasswordValid };
  }

  private toPublicUser(user: User): Omit<User, 'passwordHash' | 'role'> & { globalRole: Role } {
    const { passwordHash, role, ...publicUser } = user;
    return {
      ...publicUser,
      globalRole: role,
    };
  }
}
