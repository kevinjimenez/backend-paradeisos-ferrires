import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { envs } from './common/config/envs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('MAIN');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Desactivar etag (y por tanto evitar 304)
  app.set('etag', false);

  app.setGlobalPrefix('api', {
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

  app.enableCors();

  await app.listen(envs.port);
  logger.log(`Server running on port: [${envs.port}]`);
}
void bootstrap();
