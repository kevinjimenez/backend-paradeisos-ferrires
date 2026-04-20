import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import { appConfig } from './common/config/app.config';
import { envs } from './common/config/envs';

async function bootstrap() {
  // Buffer logs during bootstrap so nothing is lost before pino takes over
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Replace NestJS default logger with pino and flush buffered bootstrap logs
  app.useLogger(app.get(PinoLogger));
  app.flushLogs();

  const logger = app.get(PinoLogger);

  // Disable ETag headers to prevent 304 Not Modified responses
  app.set('etag', false);

  // Compress HTTP responses (gzip/deflate)
  app.use(compression());

  app.setGlobalPrefix(appConfig.prefix, appConfig.prefixOptions);
  app.useGlobalPipes(new ValidationPipe(appConfig.validation));
  app.enableCors(appConfig.cors);

  await app.listen(envs.port);
  logger.log(`Environment: ${envs.nodeEnv}`);
  logger.log(`Server running on: ${await app.getUrl()}`);
}
void bootstrap();
