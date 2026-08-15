'use client';

import { useQuery } from '@tanstack/react-query';
import { listCinemas } from '../services/cinema.service';
import type { CinemaListParams } from '../types/cinema.types';

export function useCinemas(params: CinemaListParams = {}) {
  return useQuery({
    queryKey: ['cinemas', params],
    queryFn: () => listCinemas(params),
  });
}
