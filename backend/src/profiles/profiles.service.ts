import { Injectable, NotFoundException } from '@nestjs/common';
import { UserProfile } from '@prisma/client';
import { DatabaseService } from '../database/database.service.js';
import { ProfileUpdateDto } from './dto/profiles-update-dto.js';

@Injectable()
export class ProfilesService {
  constructor(private prisma: DatabaseService) {}

  async getProfileByUserId(userId: string): Promise<UserProfile> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async putProfile(
    userId: string,
    data: ProfileUpdateDto,
  ): Promise<UserProfile> {
    return await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
  }
}
