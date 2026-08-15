export type MovieStatus = 'coming_soon' | 'now_showing' | 'ended';
export type AgeRating = 'P' | 'C13' | 'C16' | 'C18';

export interface Genre {
  id: string;
  name: string;
}

export interface Movie {
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
  genres: Genre[];
}

export interface MovieListParams {
  status?: MovieStatus;
  genreId?: string;
  page?: number;
  limit?: number;
}

export interface Review {
  id: string;
  movieId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
}

export interface CreateMoviePayload {
  title: string;
  slug?: string;
  description?: string;
  durationMinutes?: number;
  releaseDate?: string;
  ageRating?: AgeRating;
  trailerUrl?: string;
  status: MovieStatus;
  genreIds?: string[];
}

export type UpdateMoviePayload = Partial<CreateMoviePayload>;
