import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { AgeRating, MovieStatus } from '../types/movie.types';

export class CreateMovieDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationMinutes?: number;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsOptional()
  @IsIn(['P', 'C13', 'C16', 'C18'])
  ageRating?: AgeRating;

  @IsOptional()
  @IsString()
  trailerUrl?: string;

  @IsIn(['coming_soon', 'now_showing', 'ended'])
  status: MovieStatus;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  genreIds?: string[];
}
