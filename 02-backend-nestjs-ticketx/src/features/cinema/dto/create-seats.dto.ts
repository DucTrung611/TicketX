import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import type { SeatType } from '../types/cinema.types';

export class SeatItemDto {
  @IsString()
  @MaxLength(2)
  seatRow: string;

  @IsInt()
  @IsPositive()
  seatNumber: number;

  @IsOptional()
  @IsIn(['standard', 'vip', 'couple'])
  seatType?: SeatType;
}

export class CreateSeatsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SeatItemDto)
  seats: SeatItemDto[];
}
