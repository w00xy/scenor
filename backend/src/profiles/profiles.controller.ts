import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfileGetDto, ProfileUpdateDto } from './dto/index.js';
import { UserProfile } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';

@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get profile by user ID' })
  async getProfile(@Query() data: ProfileGetDto): Promise<UserProfile> {
    return await this.profilesService.getProfile({ userId: data.id });
  }

  @Put('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create profile or update existing profile' })
  async putProfile(@Body() data: ProfileUpdateDto): Promise<UserProfile> {
    return await this.profilesService.putProfile(data);
  }
}
