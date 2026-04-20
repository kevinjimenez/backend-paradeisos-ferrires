import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { envs } from './envs';

export const throttlerConfig: ThrottlerModuleOptions = [
  {
    ttl: envs.rateLimitTtl,
    limit: envs.rateLimitMax,
  },
];
