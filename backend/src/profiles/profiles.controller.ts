import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserProfile } from '@prisma/client';
import { ProfilesService } from './profiles.service.js';
import { ProfileUpdateDto } from './dto/profiles-update-dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenPayload } from '../auth/auth-token.service.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить профиль авторизованного пользователя' })
  async getProfile(@Req() request: AuthenticatedRequest): Promise<UserProfile> {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return await this.profilesService.getProfileByUserId(userId);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Создать или обновить профиль пользователя' })
  async putProfile(
    @Req() request: AuthenticatedRequest,
    @Body() data: ProfileUpdateDto,
  ): Promise<UserProfile> {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return await this.profilesService.putProfile(userId, data);
  }
}
