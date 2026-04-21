import {
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export const handleServiceError = (
  error: unknown,
  logger: Logger,
  message: string,
): never => {
  if (error instanceof HttpException) throw error;
  console.log('==========================');
  console.error(message);
  console.log('==========================');
  logger.error(
    message,
    error instanceof Error ? error.stack : JSON.stringify(error),
  );
  throw new InternalServerErrorException(message);
};
