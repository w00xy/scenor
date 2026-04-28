import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(maxRetries = 10, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting to connect to database (attempt ${attempt}/${maxRetries})...`);
        await this.$connect();
        this.logger.log('Successfully connected to database');
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Database connection attempt ${attempt} failed: ${errorMessage}`);
        
        if (attempt === maxRetries) {
          this.logger.error('Max retries reached. Could not connect to database.');
          throw error;
        }
        
        this.logger.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
