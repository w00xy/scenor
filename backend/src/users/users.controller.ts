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
import { CheckPasswordDto } from './dto/users-check-password.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthTokenPayload } from '../auth/auth-token.service.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({summary: "Создать нового пользователя"})
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан' })
  @ApiResponse({ status: 400, description: 'Bad Request - неверные данные' })
  @ApiResponse({ status: 409, description: 'Conflict - пользователь с таким email уже существует' })
  async register(@Body() data: CreateUserDto) {
    return this.usersService.createUser(data);
  }

  @Post('login')
  @ApiOperation({summary: "Войти в аккаунт"})
  @ApiResponse({ status: 200, description: 'Успешная авторизация, возвращает access и refresh токены' })
  @ApiResponse({ status: 401, description: 'Unauthorized - неверный email или пароль' })
  async login(@Body() data: LoginUserDto) {
    return this.usersService.loginUser(data);
  }

  @Post('refresh')
  @ApiOperation({summary: "Обновить jwt токены"})
  @ApiResponse({ status: 200, description: 'Токены успешно обновлены' })
  @ApiResponse({ status: 401, description: 'Unauthorized - невалидный refresh токен' })
  async refresh(@Body() data: RefreshTokenDto) {
    return this.usersService.refreshTokens(data.refreshToken);
  }

  @Get('all')
  @ApiOperation({summary: "Получить информацию о пользователях"})
  @ApiResponse({ status: 200, description: 'Список пользователей успешно получен' })
  async getAllUsers(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.usersService.getAllUsers(limit, offset);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({summary: "Получить информацию о пользователе по id"})
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Информация о пользователе успешно получена' })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 404, description: 'Not Found - пользователь не найден' })
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.getUserById(id);
  }

  @Put()
  @UseGuards(AuthGuard)
  @ApiOperation({summary: "Обновить информацию о пользователе"})
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Информация о пользователе успешно обновлена' })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 404, description: 'Not Found - пользователь не найден' })
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
  @ApiOperation({summary: "Удалить пользователя для Администратора"})
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Пользователь успешно удалён' })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Forbidden - недостаточно прав (требуется роль SUPER_ADMIN)' })
  @ApiResponse({ status: 404, description: 'Not Found - пользователь не найден' })
  async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.deleteUser(id);
  }

  @Put('password')
  @ApiOperation({summary: "Изменить пароль"})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Пароль успешно изменён' })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация или неверный старый пароль' })
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

  @Post('password')
  @ApiOperation({summary: "Проверить полученный пароль от пользователя"})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Пароль проверен, возвращает результат проверки' })
  @ApiResponse({ status: 401, description: 'Unauthorized - требуется авторизация' })
  async checkPassword(
    @Req() request: AuthenticatedRequest,
    @Body() data: CheckPasswordDto,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.usersService.checkPassword(userId, data.password);
  }
}
