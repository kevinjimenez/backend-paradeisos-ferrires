import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - start;

      let logMessage = `${method} ${originalUrl} ${statusCode} - ${responseTime}ms - ${contentLength || 0}b - ${userAgent}`;

      // Añadir color según el código de estado
      if (statusCode >= 500) {
        logMessage = `\x1b[31m${logMessage}\x1b[0m`; // Rojo para errores del servidor
      } else if (statusCode >= 400) {
        logMessage = `\x1b[33m${logMessage}\x1b[0m`; // Amarillo para errores del cliente
      } else {
        logMessage = `\x1b[32m${logMessage}\x1b[0m`; // Verde para respuestas exitosas
      }

      // Solo registrar el body para métodos que lo envían (POST, PUT, PATCH)
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        this.logger.log(`${logMessage}\nRequest Body: ${JSON.stringify(body)}`);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
