import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { DatabaseService } from '../database/database.service';

describe('ProfilesService', () => {
  let service: ProfilesService;

  beforeEach(async () => {
    const prismaMock = {
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
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
