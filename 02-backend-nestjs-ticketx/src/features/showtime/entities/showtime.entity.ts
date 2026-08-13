import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { ShowtimeStatus } from '../types/showtime.types';

@Entity('showtimes')
@Index('idx_showtimes_movie_id_start_time', ['movieId', 'startTime'])
@Index('idx_showtimes_room_id_start_time', ['roomId', 'startTime'])
export class Showtime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'movie_id', type: 'uuid' })
  movieId: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId: string;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({ name: 'base_price', type: 'numeric', precision: 10, scale: 2 })
  basePrice: string;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'ongoing', 'ended', 'cancelled'],
    default: 'scheduled',
  })
  status: ShowtimeStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
