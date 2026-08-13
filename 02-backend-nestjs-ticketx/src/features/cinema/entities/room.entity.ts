import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { RoomType } from '../types/cinema.types';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cinema_id', type: 'uuid' })
  cinemaId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({
    name: 'room_type',
    type: 'enum',
    enum: ['standard', 'imax', '4dx'],
  })
  roomType: RoomType;

  @Column({ name: 'total_seats', type: 'int', default: 0 })
  totalSeats: number;
}
