import type { PaymentProvider, PaymentStatus } from '../types/payment.types';

export class PaymentInitiateResponseDto {
  provider: PaymentProvider;
  paymentUrl: string;
  amount: number;
}

export class PaymentStatusResponseDto {
  id: string;
  bookingId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  paidAt: Date | null;
}
