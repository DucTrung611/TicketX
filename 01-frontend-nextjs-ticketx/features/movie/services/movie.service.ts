import { apiClient, unwrap, unwrapWithMeta } from '@/shared/services/api-client';
import type { ApiSuccessResponse } from '@/shared/types/api-response.type';
import type {
  CreateMoviePayload,
  CreateReviewPayload,
  Movie,
  MovieListParams,
  Review,
  UpdateMoviePayload,
} from '../types/movie.types';

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

export function listMovieReviews(movieId: string): Promise<Review[]> {
  return unwrap(
    apiClient.get<ApiSuccessResponse<Review[]>>(`/movies/${movieId}/reviews`),
  );
}

export function createMovieReview(
  movieId: string,
  payload: CreateReviewPayload,
): Promise<Review> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<Review>>(
      `/movies/${movieId}/reviews`,
      payload,
    ),
  );
}

export function createMovie(payload: CreateMoviePayload): Promise<Movie> {
  return unwrap(apiClient.post<ApiSuccessResponse<Movie>>('/movies', payload));
}

export function updateMovie(
  id: string,
  payload: UpdateMoviePayload,
): Promise<Movie> {
  return unwrap(
    apiClient.patch<ApiSuccessResponse<Movie>>(`/movies/${id}`, payload),
  );
}

export async function deleteMovie(id: string): Promise<void> {
  await apiClient.delete(`/movies/${id}`);
}

export function uploadMoviePoster(
  id: string,
  file: File,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return unwrap(
    apiClient.post<ApiSuccessResponse<{ url: string }>>(
      `/movies/${id}/poster`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    ),
  );
}
