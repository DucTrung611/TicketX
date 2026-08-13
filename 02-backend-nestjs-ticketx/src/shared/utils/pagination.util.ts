import { PaginationMeta } from '../types/paginated-result.type';

export const MAX_PAGE_LIMIT = 100;
export const DEFAULT_PAGE_LIMIT = 20;

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
