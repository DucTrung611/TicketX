import { IsIn } from 'class-validator';
import type { PaymentProvider } from '../types/payment.types';

export class InitiatePaymentDto {
  @IsIn(['vnpay', 'momo', 'stripe'])
  provider: PaymentProvider;
}
