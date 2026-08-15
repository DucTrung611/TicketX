'use client';

import { useMutation } from '@tanstack/react-query';
import { validateVoucher } from '../services/voucher.service';
import type { ValidateVoucherPayload } from '../types/voucher.types';

export function useValidateVoucher() {
  return useMutation({
    mutationFn: (payload: ValidateVoucherPayload) =>
      validateVoucher(payload.code, payload.orderAmount),
  });
}
