'use client';

import { useQuery } from '@tanstack/react-query';
import { listShowtimes } from '../services/showtime.service';
import type { ShowtimeListParams } from '../types/showtime.types';

export function useShowtimes(params: ShowtimeListParams = {}) {
  return useQuery({
    queryKey: ['showtimes', params],
    queryFn: () => listShowtimes(params),
  });
}
