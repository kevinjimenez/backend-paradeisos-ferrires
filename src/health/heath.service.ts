import { envs } from './../config/envs';
import { Injectable } from '@nestjs/common';
import type { Health } from './types/health.type';

@Injectable()
export class HealthService {
  checkStatus(): Health {
    return {
      environment: envs.nodeEnv,
      message: 'api paradeisos is up and running',
      port: envs.port,
    };
  }
}
