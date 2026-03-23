import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { envs } from './common/config/envs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('MAIN');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: [envs.logLevel],
  });
  // Desactivar etag (y por tanto evitar 304)
  app.set('etag', false);

  // // filter
  // app.useGlobalFilters(new CustomHttpExceptionFilter());
  // // interceptor
  // app.useGlobalInterceptors(new ResponseTransformInterceptor(new Reflector()));

  app.setGlobalPrefix(envs.apiPrefix, {
    exclude: [
      { path: 'health', method: RequestMethod.ALL },
      { path: '/', method: RequestMethod.ALL },
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // app.enableCors();
  app.enableCors({
    origin: envs.corsOrigin, // 'http://localhost:3001'
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  await app.listen(envs.port);
  logger.log(`Environment: ${envs.nodeEnv}`);
  logger.log(`Server running on: ${await app.getUrl()}`);
}
void bootstrap();
