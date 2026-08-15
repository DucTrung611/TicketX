export type RoomType = 'standard' | 'imax' | '4dx';
export type SeatType = 'standard' | 'vip' | 'couple';

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
}

export interface CinemaListParams {
  city?: string;
  page?: number;
  limit?: number;
}

export interface Room {
  id: string;
  cinemaId: string;
  name: string;
  roomType: RoomType;
  totalSeats: number;
}

export interface Seat {
  id: string;
  roomId: string;
  seatRow: string;
  seatNumber: number;
  seatType: SeatType;
}

export interface CreateCinemaPayload {
  name: string;
  address: string;
  city: string;
  phone?: string;
}

export interface CreateRoomPayload {
  name: string;
  roomType: RoomType;
}

export interface SeatItemPayload {
  seatRow: string;
  seatNumber: number;
  seatType?: SeatType;
}
