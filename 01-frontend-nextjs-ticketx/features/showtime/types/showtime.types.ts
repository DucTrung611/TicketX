export type ShowtimeStatus = 'scheduled' | 'ongoing' | 'ended' | 'cancelled';

export interface Showtime {
  id: string;
  movieId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  status: ShowtimeStatus;
}

export interface ShowtimeListParams {
  movieId?: string;
  cinemaId?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export type SeatAvailabilityStatus = 'available' | 'locked' | 'booked';

export interface ShowtimeSeat {
  id: string;
  seatRow: string;
  seatNumber: number;
  seatType: string;
  price: number;
  status: SeatAvailabilityStatus;
}

export interface CreateShowtimePayload {
  movieId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  basePrice: number;
}

export type UpdateShowtimePayload = Partial<CreateShowtimePayload>;
