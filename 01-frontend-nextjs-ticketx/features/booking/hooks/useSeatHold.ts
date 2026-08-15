'use client';

import { useMutation } from '@tanstack/react-query';
import { useBookingStore } from '../stores/booking.store';
import { holdSeats } from '../services/booking.service';
import type { HoldSeatsPayload } from '../types/booking.types';

export function useSeatHold() {
  const setHold = useBookingStore((state) => state.setHold);

  return useMutation({
    mutationFn: (payload: HoldSeatsPayload) => holdSeats(payload),
    onSuccess: (data) => {
      setHold(data.lockedSeats, data.expiresAt);
    },
  });
}
