export type PaymentProvider = 'vnpay' | 'momo' | 'stripe';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface PaymentInitiateResponse {
  provider: PaymentProvider;
  paymentUrl: string;
  amount: number;
}

export interface PaymentStatusResponse {
  id: string;
  bookingId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
}
