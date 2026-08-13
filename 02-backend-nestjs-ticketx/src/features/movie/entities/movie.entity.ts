import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { AgeRating, MovieStatus } from '../types/movie.types';
import { Genre } from './genre.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Index('uq_movies_slug', { unique: true })
  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number | null;

  @Column({ name: 'release_date', type: 'date', nullable: true })
  releaseDate: string | null;

  @Column({
    name: 'age_rating',
    type: 'enum',
    enum: ['P', 'C13', 'C16', 'C18'],
    nullable: true,
  })
  ageRating: AgeRating | null;

  @Column({ name: 'poster_url', type: 'varchar', nullable: true })
  posterUrl: string | null;

  @Column({ name: 'trailer_url', type: 'varchar', nullable: true })
  trailerUrl: string | null;

  @Index('idx_movies_status')
  @Column({
    type: 'enum',
    enum: ['coming_soon', 'now_showing', 'ended'],
  })
  status: MovieStatus;

  @ManyToMany(() => Genre)
  @JoinTable({
    name: 'movie_genres',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: Genre[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
