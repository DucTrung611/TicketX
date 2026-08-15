import type { VoucherDiscountType } from '../types/voucher.types';

export class VoucherResponseDto {
  id: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  validFrom: Date;
  validTo: Date;
  usageLimit: number | null;
  usedCount: number;
}

export class VoucherValidationResponseDto {
  code: string;
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
}
