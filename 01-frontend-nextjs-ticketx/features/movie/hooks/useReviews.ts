'use client';

import { useQuery } from '@tanstack/react-query';
import { listMovieReviews } from '../services/movie.service';

export function useReviews(movieId: string) {
  return useQuery({
    queryKey: ['movies', movieId, 'reviews'],
    queryFn: () => listMovieReviews(movieId),
  });
}
