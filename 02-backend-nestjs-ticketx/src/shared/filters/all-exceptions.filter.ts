import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../types/api-response.type';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ApiErrorResponse =
      exception instanceof HttpException
        ? this.fromHttpException(exception)
        : {
            success: false,
            error: {
              code: 'SYSTEM_001',
              message: 'Unexpected server error',
              details: null,
            },
          };

    if (status >= 500) {
      this.logger.error(exception);
    }

    response.status(status).json(body);
  }

  private fromHttpException(exception: HttpException): ApiErrorResponse {
    const res = exception.getResponse();

    if (typeof res === 'object' && res !== null) {
      const { code, message, details } = res as {
        code?: string;
        message?: string | string[];
        details?: unknown[];
      };

      return {
        success: false,
        error: {
          code: code ?? 'VALIDATION_001',
          message: Array.isArray(message)
            ? message.join(', ')
            : (message ?? exception.message),
          details: details ?? (Array.isArray(message) ? message : null),
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'VALIDATION_001',
        message: exception.message,
        details: null,
      },
    };
  }
}
