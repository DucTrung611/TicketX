'use client';

import { useMutation } from '@tanstack/react-query';
import { checkinBooking } from '../services/booking.service';

export function useCheckinBooking() {
  return useMutation({
    mutationFn: (bookingId: string) => checkinBooking(bookingId),
  });
}
