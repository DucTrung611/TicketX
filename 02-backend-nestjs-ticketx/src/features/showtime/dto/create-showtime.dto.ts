import { IsDateString, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateShowtimeDto {
  @IsUUID('4')
  movieId: string;

  @IsUUID('4')
  roomId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  @IsPositive()
  basePrice: number;
}
