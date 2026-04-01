import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    this.logger.error(
      JSON.stringify({
        statusCode: status,
        path: request.url,
        method: request.method,
        message:
          typeof message === 'string'
            ? message
            : (message as Record<string, unknown>).message,
        timestamp: new Date().toISOString(),
      }),
    );

    const body =
      typeof message === 'string' ? { statusCode: status, message } : message;

    response.status(status).json(body);
  }
}
