import { IsIn, IsString, MaxLength } from 'class-validator';
import type { RoomType } from '../types/cinema.types';

export class CreateRoomDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsIn(['standard', 'imax', '4dx'])
  roomType: RoomType;
}
