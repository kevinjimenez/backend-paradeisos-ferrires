import { envs } from 'src/common/config/envs';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

const logger = new Logger('DatabaseService');

@Injectable()
export class DatabasesService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: envs.databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
      logger.log('✅ Prisma connected');
    } catch (error) {
      logger.error('❌ Prisma connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    logger.log('🔌 Prisma disconnected');
  }
}
