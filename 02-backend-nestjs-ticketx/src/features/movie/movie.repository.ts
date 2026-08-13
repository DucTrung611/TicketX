import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { Genre } from './entities/genre.entity';
import type { MovieStatus } from './types/movie.types';

export interface MovieFilter {
  status?: MovieStatus;
  genreId?: string;
  page: number;
  limit: number;
  sortOrder: 'asc' | 'desc';
}

@Injectable()
export class MovieRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
  ) {}

  async findAndCount(filter: MovieFilter): Promise<[Movie[], number]> {
    const qb = this.movieRepo
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genre')
      .orderBy(
        'movie.releaseDate',
        filter.sortOrder.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip((filter.page - 1) * filter.limit)
      .take(filter.limit);

    if (filter.status) {
      qb.andWhere('movie.status = :status', { status: filter.status });
    }

    if (filter.genreId) {
      qb.andWhere(
        'movie.id IN (SELECT mg.movie_id FROM movie_genres mg WHERE mg.genre_id = :genreId)',
        { genreId: filter.genreId },
      );
    }

    return qb.getManyAndCount();
  }

  findById(id: string): Promise<Movie | null> {
    return this.movieRepo.findOne({ where: { id }, relations: ['genres'] });
  }

  findBySlug(slug: string): Promise<Movie | null> {
    return this.movieRepo.findOne({ where: { slug } });
  }

  findGenresByIds(ids: string[]): Promise<Genre[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.genreRepo.find({ where: { id: In(ids) } });
  }

  create(data: Partial<Movie>): Promise<Movie> {
    const movie = this.movieRepo.create(data);
    return this.movieRepo.save(movie);
  }

  save(movie: Movie): Promise<Movie> {
    return this.movieRepo.save(movie);
  }

  async delete(id: string): Promise<void> {
    await this.movieRepo.delete(id);
  }
}
