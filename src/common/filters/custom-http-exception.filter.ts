import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class CustomHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as string | { message: string | string[] })
        : 'Internal Server error';

    const resolvedMessage =
      typeof message === 'string'
        ? message
        : Array.isArray(message.message)
          ? message.message[0]
          : message.message;

    if (status >= 500) {
      this.logger.error(exception);
    }

    response.status(status).json({
      error: {
        statusCode: status,
        message: resolvedMessage,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
