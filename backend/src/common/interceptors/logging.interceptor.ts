import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const ip = request.ip;
    const userAgent = request.get('user-agent') || '';
    const userId =
      ((request as Request & { user?: { id?: string } }).user?.id as string) ||
      'anonymous';

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode = response.statusCode;
        const duration = Date.now() - now;

        this.logger.log(
          JSON.stringify({
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            userId,
            ip,
            userAgent: userAgent.substring(0, 100),
          }),
        );
      }),
    );
  }
}
