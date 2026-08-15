'use client';

import { useMutation } from '@tanstack/react-query';
import { useBookingStore } from '../stores/booking.store';
import { createBooking } from '../services/booking.service';
import type { CreateBookingPayload } from '../types/booking.types';

export function useCreateBooking() {
  const clearSelection = useBookingStore((state) => state.clearSelection);

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: () => {
      clearSelection();
    },
  });
}
