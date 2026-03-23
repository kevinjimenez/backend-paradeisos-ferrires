import { randomUUID } from 'crypto';
import { Params } from 'nestjs-pino';
import { envs } from './envs';

export const pinoConfig: Params = {
  pinoHttp: {
    level: envs.logLevel,
    genReqId: () => randomUUID(),
    autoLogging: {
      ignore: (req) => req.url?.includes('/health') ?? false,
    },
    // serializers: {
    //   req: (req) => ({
    //     id: req.id,
    //     method: req.method,
    //     url: req.url,
    //     ...(envs.nodeEnv !== 'prod' && { body: req.raw.body }),
    //   }),
    //   res: (res) => ({
    //     statusCode: res.statusCode,
    //   }),
    // },
    // redact: {
    //   paths: [
    //     'req.headers.authorization',
    //     'req.body.password',
    //     'req.body.cardNumber',
    //     'req.body.cvv',
    //     'req.body.token',
    //   ],
    //   censor: '***',
    // },
    transport:
      envs.nodeEnv !== 'prod'
        ? {
            target: 'pino-pretty',
            options: { colorize: true, singleLine: true },
          }
        : undefined,
  },
};
