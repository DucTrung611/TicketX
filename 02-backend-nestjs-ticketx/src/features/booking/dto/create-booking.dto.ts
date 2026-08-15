import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class BookingComboItemDto {
  @IsUUID('4')
  comboId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateBookingDto {
  @IsUUID('4')
  showtimeId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  seatIds: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingComboItemDto)
  comboItems?: BookingComboItemDto[];

  @IsOptional()
  @IsString()
  voucherCode?: string;
}
