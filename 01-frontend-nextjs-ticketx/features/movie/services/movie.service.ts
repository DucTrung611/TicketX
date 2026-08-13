import { apiClient, unwrap, unwrapWithMeta } from '@/shared/services/api-client';
import type { ApiSuccessResponse } from '@/shared/types/api-response.type';
import type { Movie, MovieListParams } from '../types/movie.types';

export async function listMovies(
  params: MovieListParams = {},
): Promise<{ data: Movie[]; meta: ApiSuccessResponse<Movie[]>['meta'] }> {
  return unwrapWithMeta(
    apiClient.get<ApiSuccessResponse<Movie[]>>('/movies', { params }),
  );
}

export function getMovieById(id: string): Promise<Movie> {
  return unwrap(apiClient.get<ApiSuccessResponse<Movie>>(`/movies/${id}`));
}
