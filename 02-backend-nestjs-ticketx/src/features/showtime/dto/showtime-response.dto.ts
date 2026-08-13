import type { ShowtimeStatus } from '../types/showtime.types';

export class ShowtimeResponseDto {
  id: string;
  movieId: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  basePrice: number;
  status: ShowtimeStatus;
}
