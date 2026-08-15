import { IsPositive, IsString } from 'class-validator';

export class ValidateVoucherDto {
  @IsString()
  code: string;

  @IsPositive()
  orderAmount: number;
}
