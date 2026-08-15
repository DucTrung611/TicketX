import { apiClient, unwrap, unwrapWithMeta } from '@/shared/services/api-client';
import type { ApiSuccessResponse } from '@/shared/types/api-response.type';
import type {
  CreateVoucherPayload,
  Voucher,
  VoucherValidationResult,
} from '../types/voucher.types';

export function validateVoucher(
  code: string,
  orderAmount: number,
): Promise<VoucherValidationResult> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<VoucherValidationResult>>('/vouchers/validate', {
      code,
      orderAmount,
    }),
  );
}

export async function listVouchers(): Promise<Voucher[]> {
  const { data } = await unwrapWithMeta(
    apiClient.get<ApiSuccessResponse<Voucher[]>>('/vouchers', {
      params: { limit: 100 },
    }),
  );
  return data;
}

export function createVoucher(payload: CreateVoucherPayload): Promise<Voucher> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<Voucher>>('/vouchers', payload),
  );
}
