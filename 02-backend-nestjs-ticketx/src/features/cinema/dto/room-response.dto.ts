import type { RoomType } from '../types/cinema.types';

export class RoomResponseDto {
  id: string;
  cinemaId: string;
  name: string;
  roomType: RoomType;
  totalSeats: number;
}
