export interface ValidateVoucherPayload {
  code: string;
  orderAmount: number;
}

export interface VoucherValidationResult {
  code: string;
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
}

export type VoucherDiscountType = 'percent' | 'fixed';

export interface Voucher {
  id: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  validFrom: string;
  validTo: string;
  usageLimit: number | null;
  usedCount: number;
}

export interface CreateVoucherPayload {
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
}
