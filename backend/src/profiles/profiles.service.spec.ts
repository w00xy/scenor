import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfilesService } from './profiles.service.js';
import { DatabaseService } from '../database/database.service.js';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prisma: {
    userProfile: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      userProfile: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: DatabaseService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getProfileByUserId should return profile', async () => {
    const profile = {
      id: 'ec81afcb-5f3d-4f7f-b48a-6bbf96d2f6f7',
      userId: 'c22a2af0-92f4-4490-b4d4-bd4f38f24684',
      firstName: 'Alex',
      lastName: null,
      bio: null,
      phone: null,
      avatarUrl: null,
      createdAt: new Date('2026-01-10T10:00:00.000Z'),
      updatedAt: new Date('2026-01-10T10:00:00.000Z'),
    };
    prisma.userProfile.findUnique.mockResolvedValue(profile);

    const result = await service.getProfileByUserId(profile.userId);

    expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: profile.userId },
    });
    expect(result).toEqual(profile);
  });

  it('getProfileByUserId should throw NotFoundException when profile is missing', async () => {
    prisma.userProfile.findUnique.mockResolvedValue(null);

    await expect(
      service.getProfileByUserId('4196ee3f-ebde-4b7b-ba80-f38726f173b5'),
    ).rejects.toThrow(NotFoundException);
  });

  it('putProfile should upsert by current user id', async () => {
    const userId = '4d1df2a8-b444-4a13-aafe-c7576679f7f0';
    const data = {
      firstName: 'Alex',
      lastName: 'Johnson',
      phone: '+79998887766',
    };
    const profile = {
      id: '919e5bcc-0e70-4e58-8c04-8898bb111af2',
      userId,
      firstName: 'Alex',
      lastName: 'Johnson',
      bio: null,
      phone: '+79998887766',
      avatarUrl: null,
      createdAt: new Date('2026-01-10T10:00:00.000Z'),
      updatedAt: new Date('2026-01-10T10:00:00.000Z'),
    };
    prisma.userProfile.upsert.mockResolvedValue(profile);

    const result = await service.putProfile(userId, data);

    expect(prisma.userProfile.upsert).toHaveBeenCalledWith({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
    expect(result).toEqual(profile);
  });
});
