import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/users-create.dto.js';
import { UpdateUserDto } from './dto/users-update.dto.js';
import { LoginUserDto } from './dto/users-login.dto.js';
import { RefreshTokenDto } from './dto/users-refresh-token.dto.js';
import { ChangePasswordDto } from './dto/users-change-password.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthTokenPayload } from '../auth/auth-token.service.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() data: CreateUserDto) {
    return this.usersService.createUser(data);
  }

  @Post('login')
  async login(@Body() data: LoginUserDto) {
    return this.usersService.loginUser(data);
  }

  @Post('refresh')
  async refresh(@Body() data: RefreshTokenDto) {
    return this.usersService.refreshTokens(data.refreshToken);
  }

  @Get('all')
  async getAllUsers(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.usersService.getAllUsers(limit, offset);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.getUserById(id);
  }

  @Put()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  async updateUser(
    @Req() request: AuthenticatedRequest,
    @Body() data: UpdateUserDto,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.usersService.updateUser(userId, data);
  }

  @Delete(':id/delete')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('access-token')
  async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.deleteUser(id);
  }

  @Put('password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  async changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() data: ChangePasswordDto,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.usersService.changePassword(userId, data);
  }
}
