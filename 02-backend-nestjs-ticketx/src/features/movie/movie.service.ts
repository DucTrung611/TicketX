import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { PaginatedResult } from '../../shared/types/paginated-result.type';
import { buildPaginationMeta } from '../../shared/utils/pagination.util';
import { MovieRepository } from './movie.repository';
import { ReviewRepository } from './review.repository';
import { Movie } from './entities/movie.entity';
import { Review } from './entities/review.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieQueryDto } from './dto/movie-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly reviewRepository: ReviewRepository,
  ) {}

  async list(query: MovieQueryDto): Promise<PaginatedResult<MovieResponseDto>> {
    const [movies, total] = await this.movieRepository.findAndCount({
      status: query.status,
      genreId: query.genreId,
      page: query.page,
      limit: query.limit,
      sortOrder: query.sortOrder,
    });

    return {
      items: movies.map((movie) => this.toResponseDto(movie)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getByIdOrThrow(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundException({
        code: 'MOVIE_001',
        message: 'Movie not found',
      });
    }
    return movie;
  }

  async create(dto: CreateMovieDto): Promise<Movie> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const existing = await this.movieRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException({
        code: 'MOVIE_002',
        message: 'A movie with this slug already exists',
      });
    }

    const genres = await this.movieRepository.findGenresByIds(
      dto.genreIds ?? [],
    );

    return this.movieRepository.create({
      title: dto.title,
      slug,
      description: dto.description ?? null,
      durationMinutes: dto.durationMinutes ?? null,
      releaseDate: dto.releaseDate ?? null,
      ageRating: dto.ageRating ?? null,
      trailerUrl: dto.trailerUrl ?? null,
      status: dto.status,
      genres,
    });
  }

  async update(id: string, dto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.getByIdOrThrow(id);

    if (dto.slug || dto.title) {
      const nextSlug = slugify(dto.slug ?? dto.title ?? movie.slug);
      if (nextSlug !== movie.slug) {
        const existing = await this.movieRepository.findBySlug(nextSlug);
        if (existing) {
          throw new ConflictException({
            code: 'MOVIE_002',
            message: 'A movie with this slug already exists',
          });
        }
        movie.slug = nextSlug;
      }
    }

    if (dto.genreIds) {
      movie.genres = await this.movieRepository.findGenresByIds(dto.genreIds);
    }

    Object.assign(movie, {
      title: dto.title ?? movie.title,
      description: dto.description ?? movie.description,
      durationMinutes: dto.durationMinutes ?? movie.durationMinutes,
      releaseDate: dto.releaseDate ?? movie.releaseDate,
      ageRating: dto.ageRating ?? movie.ageRating,
      trailerUrl: dto.trailerUrl ?? movie.trailerUrl,
      status: dto.status ?? movie.status,
    });

    return this.movieRepository.save(movie);
  }

  async remove(id: string): Promise<void> {
    await this.getByIdOrThrow(id);
    try {
      await this.movieRepository.delete(id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as unknown as { code?: string }).code === '23503'
      ) {
        throw new ConflictException({
          code: 'MOVIE_003',
          message: 'Cannot delete a movie with existing reviews or showtimes',
        });
      }
      throw error;
    }
  }

  async setPoster(id: string, posterUrl: string): Promise<Movie> {
    const movie = await this.getByIdOrThrow(id);
    movie.posterUrl = posterUrl;
    return this.movieRepository.save(movie);
  }

  async listReviews(movieId: string): Promise<ReviewResponseDto[]> {
    await this.getByIdOrThrow(movieId);
    const reviews = await this.reviewRepository.findByMovieId(movieId);
    return reviews.map((review) => this.toReviewResponseDto(review));
  }

  async addReview(
    movieId: string,
    userId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    await this.getByIdOrThrow(movieId);
    const review = await this.reviewRepository.create({
      movieId,
      userId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });
    return this.toReviewResponseDto(review);
  }

  toResponseDto(movie: Movie): MovieResponseDto {
    return {
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      description: movie.description,
      durationMinutes: movie.durationMinutes,
      releaseDate: movie.releaseDate,
      ageRating: movie.ageRating,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl,
      status: movie.status,
      genres: (movie.genres ?? []).map((genre) => ({
        id: genre.id,
        name: genre.name,
      })),
    };
  }

  toReviewResponseDto(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      movieId: review.movieId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }
}
