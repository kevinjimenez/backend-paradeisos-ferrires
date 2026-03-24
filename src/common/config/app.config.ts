import { RequestMethod, ValidationPipeOptions } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { envs } from './envs';

export const appConfig = {
  // Global route prefix (e.g. /api/schedules) — /health and / are excluded
  prefix: envs.apiPrefix,
  prefixOptions: {
    exclude: [
      { path: 'health', method: RequestMethod.ALL },
      { path: '/', method: RequestMethod.ALL },
    ],
  },

  // Strip unknown fields (whitelist) and reject requests that send them (forbidNonWhitelisted)
  validation: {
    whitelist: true,
    forbidNonWhitelisted: true,
  } satisfies ValidationPipeOptions,

  // Allow requests only from the configured origin with credentials (cookies/auth headers)
  cors: {
    origin: envs.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  } satisfies CorsOptions,
};
