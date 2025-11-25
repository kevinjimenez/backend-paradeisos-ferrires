import { Controller, Get } from '@nestjs/common';
import { HealthService } from './heath.service';
import type { Health } from './types/health.type';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  checkHealth(): Health {
    return this.healthService.checkStatus();
  }
}
