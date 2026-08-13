'use client';

import { useQuery } from '@tanstack/react-query';
import { listMovies } from '../services/movie.service';
import type { MovieListParams } from '../types/movie.types';

export function useMovies(params: MovieListParams = {}) {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => listMovies(params),
  });
}
