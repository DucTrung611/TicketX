'use client';

import { useQuery } from '@tanstack/react-query';
import { getPaymentStatus } from '../services/payment.service';

export function usePaymentStatus(bookingId: string, isPolling: boolean) {
  return useQuery({
    queryKey: ['payments', bookingId],
    queryFn: () => getPaymentStatus(bookingId),
    enabled: isPolling,
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' || !query.state.data ? 2000 : false,
  });
}
