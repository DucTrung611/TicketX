import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class CinemaQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  city?: string;
}
