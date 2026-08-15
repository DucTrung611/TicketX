import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../types/api-response.type';
import { PaginatedResult } from '../types/paginated-result.type';
import { SKIP_TRANSFORM_KEY } from '../decorators/skip-transform.decorator';

function isPaginatedResult<T>(payload: unknown): payload is PaginatedResult<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'items' in payload &&
    'meta' in payload
  );
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T> | T
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T> | T> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return next.handle();
    }

    return next.handle().pipe(
      map((payload: T | PaginatedResult<T>) => {
        if (isPaginatedResult<T>(payload)) {
          return {
            success: true,
            data: payload.items,
            meta: payload.meta,
          } as ApiSuccessResponse<T>;
        }
        return { success: true, data: payload };
      }),
    );
  }
}
