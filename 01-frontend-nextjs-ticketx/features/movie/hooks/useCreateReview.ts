'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMovieReview } from '../services/movie.service';
import type { CreateReviewPayload } from '../types/movie.types';

export function useCreateReview(movieId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) =>
      createMovieReview(movieId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['movies', movieId, 'reviews'],
      });
    },
  });
}
