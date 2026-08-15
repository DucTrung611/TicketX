import { apiClient, unwrap, unwrapWithMeta } from '@/shared/services/api-client';
import type { ApiSuccessResponse } from '@/shared/types/api-response.type';
import type {
  Booking,
  CreateBookingPayload,
  HoldResponse,
  HoldSeatsPayload,
  Ticket,
} from '../types/booking.types';

export function holdSeats(payload: HoldSeatsPayload): Promise<HoldResponse> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<HoldResponse>>('/bookings/hold', payload),
  );
}

export function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  return unwrap(apiClient.post<ApiSuccessResponse<Booking>>('/bookings', payload));
}

export async function listBookings(): Promise<Booking[]> {
  const { data } = await unwrapWithMeta(
    apiClient.get<ApiSuccessResponse<Booking[]>>('/bookings', {
      params: { limit: 100 },
    }),
  );
  return data;
}

export function getBookingById(id: string): Promise<Booking> {
  return unwrap(apiClient.get<ApiSuccessResponse<Booking>>(`/bookings/${id}`));
}

export function cancelBooking(id: string): Promise<{ message: string }> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<{ message: string }>>(
      `/bookings/${id}/cancel`,
    ),
  );
}

export function getTicket(id: string): Promise<Ticket> {
  return unwrap(apiClient.get<ApiSuccessResponse<Ticket>>(`/bookings/${id}/ticket`));
}

export function checkinBooking(id: string): Promise<Booking> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<Booking>>(`/bookings/${id}/checkin`),
  );
}
