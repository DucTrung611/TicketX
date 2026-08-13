import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class ShowtimeQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('4')
  movieId?: string;

  @IsOptional()
  @IsUUID('4')
  cinemaId?: string;

  @IsOptional()
  @IsDateString({ strict: false })
  date?: string;
}
