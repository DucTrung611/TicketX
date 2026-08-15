'use client';

import { useMutation } from '@tanstack/react-query';
import { initiatePayment } from '../services/payment.service';
import type { PaymentProvider } from '../types/payment.types';

export function useInitiatePayment(bookingId: string) {
  return useMutation({
    mutationFn: (provider: PaymentProvider) =>
      initiatePayment(bookingId, provider),
  });
}
