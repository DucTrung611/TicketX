import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { SeatType } from '../types/cinema.types';

@Entity('seats')
@Index(
  'uq_seats_room_id_seat_row_seat_number',
  ['roomId', 'seatRow', 'seatNumber'],
  {
    unique: true,
  },
)
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId: string;

  @Column({ name: 'seat_row', type: 'varchar', length: 2 })
  seatRow: string;

  @Column({ name: 'seat_number', type: 'int' })
  seatNumber: number;

  @Column({
    name: 'seat_type',
    type: 'enum',
    enum: ['standard', 'vip', 'couple'],
    default: 'standard',
  })
  seatType: SeatType;
}
