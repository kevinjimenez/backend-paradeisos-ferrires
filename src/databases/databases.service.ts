import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { envs } from './../common/config/envs';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class DatabasesService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabasesService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: envs.databaseUrl,
      ssl: envs.nodeEnv !== 'local' ? { rejectUnauthorized: false } : undefined,
    });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected successfully');
    } catch (error) {
      this.logger.error('Prisma connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Prisma disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Prisma:', error);
    }
  }
}
