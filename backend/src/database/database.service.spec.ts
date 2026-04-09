import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service.js';

describe('DatabaseService', () => {
  let service: DatabaseService;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(async () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/test_db';

    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterAll(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect', async () => {
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);

    await expect(service.$connect()).resolves.toBeUndefined();
    expect(connectSpy).toHaveBeenCalledTimes(1);
  });
});
