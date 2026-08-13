import type { AgeRating, MovieStatus } from '../types/movie.types';

export class MovieResponseDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number | null;
  releaseDate: string | null;
  ageRating: AgeRating | null;
  posterUrl: string | null;
  trailerUrl: string | null;
  status: MovieStatus;
  genres: { id: string; name: string }[];
}
