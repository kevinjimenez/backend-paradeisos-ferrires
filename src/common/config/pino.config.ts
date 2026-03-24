/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { randomUUID } from 'crypto';
import { Params } from 'nestjs-pino';
import { envs } from './envs';

const isProd = envs.nodeEnv === 'prod';

// Human-readable output for dev/local — disabled in prod (raw JSON)
const devTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    singleLine: false,
    translateTime: 'SYS:HH:MM:ss.l', // local time instead of unix timestamp
    ignore: 'pid,hostname', // remove noise fields
  },
};

export const pinoConfig: Params = {
  // Apply pino-http middleware to all routes (required in nestjs-pino v4+)
  forRoutes: ['*'],
  pinoHttp: {
    // Minimum log level from env (trace | debug | info | warn | error | fatal)
    level: envs.logLevel,

    // Unique ID per request for tracing across logs
    genReqId: () => randomUUID(),

    // Skip automatic HTTP logging for /health (avoid noise in uptime checks)
    autoLogging: {
      ignore: (req) => req.url?.includes('/health') ?? false,
    },

    // Map HTTP status codes to log levels: 4xx → warn, 5xx → error, rest → info
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },

    // Only log when response finishes, not on request received (avoids duplicate logs)
    quietReqLogger: true,

    // Message format: "GET /api/schedules → 200"
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} → ${res.statusCode}`,
    customErrorMessage: (req, res, err) =>
      `${req.method} ${req.url} → ${res.statusCode} ${err.message}`,

    // Control which request/response fields are logged
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        ...(!isProd && { body: req.raw.body }), // include body only in dev
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },

    // Replace sensitive values with '***' before logging
    redact: {
      paths: [
        'req.headers.authorization',
        'req.body.password',
        'req.body.cardNumber',
        'req.body.cvv',
        'req.body.token',
      ],
      censor: '***',
    },

    transport: !isProd ? devTransport : undefined,
  },
};
