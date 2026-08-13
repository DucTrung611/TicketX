import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCinemaDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  address: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
