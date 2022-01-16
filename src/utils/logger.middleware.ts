import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  use(request: Request, response: Response, next: NextFunction) {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const currentTime = new Date().toJSON();
      fs.appendFileSync(
        'logs/requestLogger.log',
        `${currentTime} ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}\n`,
      );
      this.logger.log(
        `${currentTime} ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
