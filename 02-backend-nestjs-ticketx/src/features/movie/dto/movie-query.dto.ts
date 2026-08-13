import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';
import type { MovieStatus } from '../types/movie.types';

export class MovieQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['coming_soon', 'now_showing', 'ended'])
  status?: MovieStatus;

  @IsOptional()
  @IsUUID('4')
  genreId?: string;
}
