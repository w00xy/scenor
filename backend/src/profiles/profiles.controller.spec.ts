import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ProfilesController } from './profiles.controller.js';
import { ProfilesService } from './profiles.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenService } from '../auth/auth-token.service.js';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profilesService: jest.Mocked<ProfilesService>;

  beforeEach(async () => {
    const profilesServiceMock = {
      getProfileByUserId: jest.fn(),
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
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: AuthTokenService,
          useValue: { verifyAccessToken: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    profilesService = module.get(ProfilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getProfile should use user id from token payload', async () => {
    const userId = '163f81cc-9b0d-4da8-b95f-7de5198a5c73';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = { user: { sub: userId } } as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const profile = {
      id: 'f57232ba-d8b9-45b2-818c-8f63dc058f27',
      userId,
      firstName: 'Alex',
    } as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    profilesService.getProfileByUserId.mockResolvedValue(profile);

    const result = await controller.getProfile(request);

    expect(profilesService.getProfileByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual(profile);
  });

  it('getProfile should throw UnauthorizedException when request has no user', async () => {
    await expect(controller.getProfile({} as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('putProfile should use user id from token payload', async () => {
    const userId = 'eb909ddf-8674-4760-97fc-532f7e5776d0';
    const request = { user: { sub: userId } } as any;
    const data = { firstName: 'Alex', lastName: 'Johnson' };
    const profile = {
      id: 'a6f8df29-f2c6-4ab4-bf6c-1a9b9a2f94e4',
      userId,
      firstName: 'Alex',

      lastName: 'Johnson',
    } as any;

    profilesService.putProfile.mockResolvedValue(profile);

    const result = await controller.putProfile(request, data);

    expect(profilesService.putProfile).toHaveBeenCalledWith(userId, data);
    expect(result).toEqual(profile);
  });
});
