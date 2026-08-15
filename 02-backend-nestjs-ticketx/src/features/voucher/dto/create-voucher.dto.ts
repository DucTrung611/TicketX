import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import type { VoucherDiscountType } from '../types/voucher.types';

export class CreateVoucherDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsIn(['percent', 'fixed'])
  discountType: VoucherDiscountType;

  @IsPositive()
  discountValue: number;

  @IsOptional()
  @IsPositive()
  maxDiscount?: number;

  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validTo: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  usageLimit?: number;
}
