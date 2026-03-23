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
  logger.error(message, error);
  throw new InternalServerErrorException(message);
};
