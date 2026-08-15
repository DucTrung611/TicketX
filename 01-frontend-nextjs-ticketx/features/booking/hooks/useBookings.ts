'use client';

import { useQuery } from '@tanstack/react-query';
import { listBookings } from '../services/booking.service';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: listBookings,
  });
}
