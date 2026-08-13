import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../types/api-response.type';
import { PaginatedResult } from '../types/paginated-result.type';

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
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
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
