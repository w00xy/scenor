import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(`→ ${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Log request body for POST/PUT/PATCH (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const sanitizedBody = this.sanitizeBody(req.body);
      if (Object.keys(sanitizedBody).length > 0) {
        this.logger.debug(`Body: ${JSON.stringify(sanitizedBody)}`);
      }
    }

    // Log response
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;

      const logMessage = `← ${method} ${originalUrl} ${statusCode} ${contentLength || 0}b - ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }

  private sanitizeBody(body: unknown): Record<string, unknown> {
    if (!body || typeof body !== 'object') {
      return {};
    }

    const sensitiveFields = [
      'password',
      'passwordHash',
      'currentPassword',
      'newPassword',
      'token',
      'refreshToken',
      'accessToken',
      'secret',
      'apiKey',
      'credentialData',
    ];

    const sanitized = { ...(body as Record<string, unknown>) };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
