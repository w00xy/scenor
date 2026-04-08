import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma, UserProfile } from '@prisma/client';
import { UpdateProfileDto } from './dto/index.js';

@Injectable()
export class ProfilesService {
  constructor(private prisma: DatabaseService) {}

  async getProfile(
    userProfileWhereUniqueInput: Prisma.UserProfileWhereUniqueInput,
  ): Promise<UserProfile> {
    const profile = await this.prisma.userProfile.findUnique({
      where: userProfileWhereUniqueInput,
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async putProfile(data: UpdateProfileDto): Promise<UserProfile> {
    const { userId, ...updateData } = data;

    return await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...updateData,
      },
      update: updateData,
    });
  }
}
