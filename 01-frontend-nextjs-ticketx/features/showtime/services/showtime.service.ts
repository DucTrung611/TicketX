import { apiClient, unwrap, unwrapWithMeta } from '@/shared/services/api-client';
import type { ApiSuccessResponse } from '@/shared/types/api-response.type';
import type {
  CreateShowtimePayload,
  Showtime,
  ShowtimeListParams,
  ShowtimeSeat,
  UpdateShowtimePayload,
} from '../types/showtime.types';

export async function listShowtimes(
  params: ShowtimeListParams = {},
): Promise<Showtime[]> {
  const { data } = await unwrapWithMeta(
    apiClient.get<ApiSuccessResponse<Showtime[]>>('/showtimes', {
      params: { limit: 100, ...params },
    }),
  );
  return data;
}

export function getShowtimeById(id: string): Promise<Showtime> {
  return unwrap(apiClient.get<ApiSuccessResponse<Showtime>>(`/showtimes/${id}`));
}

export function getShowtimeSeats(id: string): Promise<ShowtimeSeat[]> {
  return unwrap(
    apiClient.get<ApiSuccessResponse<ShowtimeSeat[]>>(`/showtimes/${id}/seats`),
  );
}

export function createShowtime(
  payload: CreateShowtimePayload,
): Promise<Showtime> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<Showtime>>('/showtimes', payload),
  );
}

export function updateShowtime(
  id: string,
  payload: UpdateShowtimePayload,
): Promise<Showtime> {
  return unwrap(
    apiClient.patch<ApiSuccessResponse<Showtime>>(`/showtimes/${id}`, payload),
  );
}

export async function deleteShowtime(id: string): Promise<void> {
  await apiClient.delete(`/showtimes/${id}`);
}
