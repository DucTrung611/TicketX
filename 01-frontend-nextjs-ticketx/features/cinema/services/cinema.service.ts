import { apiClient, unwrap, unwrapWithMeta } from '@/shared/services/api-client';
import type { ApiSuccessResponse } from '@/shared/types/api-response.type';
import type {
  Cinema,
  CinemaListParams,
  CreateCinemaPayload,
  CreateRoomPayload,
  Room,
  Seat,
  SeatItemPayload,
} from '../types/cinema.types';

export async function listCinemas(
  params: CinemaListParams = {},
): Promise<Cinema[]> {
  const { data } = await unwrapWithMeta(
    apiClient.get<ApiSuccessResponse<Cinema[]>>('/cinemas', {
      params: { limit: 100, ...params },
    }),
  );
  return data;
}

export function listRooms(cinemaId: string): Promise<Room[]> {
  return unwrap(
    apiClient.get<ApiSuccessResponse<Room[]>>(`/cinemas/${cinemaId}/rooms`),
  );
}

export function listSeats(roomId: string): Promise<Seat[]> {
  return unwrap(apiClient.get<ApiSuccessResponse<Seat[]>>(`/rooms/${roomId}/seats`));
}

export function createCinema(payload: CreateCinemaPayload): Promise<Cinema> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<Cinema>>('/cinemas', payload),
  );
}

export function createRoom(
  cinemaId: string,
  payload: CreateRoomPayload,
): Promise<Room> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<Room>>(
      `/cinemas/${cinemaId}/rooms`,
      payload,
    ),
  );
}

export function createSeats(
  roomId: string,
  seats: SeatItemPayload[],
): Promise<Seat[]> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<Seat[]>>(`/rooms/${roomId}/seats`, {
      seats,
    }),
  );
}
