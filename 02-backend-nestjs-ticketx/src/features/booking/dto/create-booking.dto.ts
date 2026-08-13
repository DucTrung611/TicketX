import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID('4')
  showtimeId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  seatIds: string[];
}
