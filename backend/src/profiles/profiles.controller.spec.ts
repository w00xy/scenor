import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { AuthTokenService } from '../auth/auth-token.service';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  beforeEach(async () => {
    const profilesServiceMock = {
      getProfile: jest.fn(),
      putProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: profilesServiceMock,
        },
        {
          provide: AuthTokenService,
          useValue: { verifyAccessToken: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
