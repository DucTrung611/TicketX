'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '../services/booking.service';

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
