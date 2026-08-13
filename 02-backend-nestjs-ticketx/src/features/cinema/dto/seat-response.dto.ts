import type { SeatType } from '../types/cinema.types';

export class SeatResponseDto {
  id: string;
  roomId: string;
  seatRow: string;
  seatNumber: number;
  seatType: SeatType;
}
