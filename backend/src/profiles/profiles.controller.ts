import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ApiOperation } from '@nestjs/swagger';
import { GetProfileDto, UpdateProfileDto } from './dto/index.js';
import { UserProfile } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';

@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get profile by user ID' })
  async getProfile(@Query() data: GetProfileDto): Promise<UserProfile> {
    return await this.profilesService.getProfile({ userId: data.id });
  }

  @Put('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create profile or update existing profile' })
  async putProfile(@Body() data: UpdateProfileDto): Promise<UserProfile> {
    return await this.profilesService.putProfile(data);
  }
}
