import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './heath.service';

@Module({
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
