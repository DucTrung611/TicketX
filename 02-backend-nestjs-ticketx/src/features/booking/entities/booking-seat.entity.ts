import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { BookingStatus } from '../types/booking.types';

@Entity('booking_seats')
@Index('uq_booking_seats_showtime_id_seat_id', ['showtimeId', 'seatId'], {
  unique: true,
  where: `"status" IN ('pending', 'confirmed')`,
})
export class BookingSeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'showtime_id', type: 'uuid' })
  showtimeId: string;

  @Column({ name: 'seat_id', type: 'uuid' })
  seatId: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'expired'],
    default: 'pending',
  })
  status: BookingStatus;
}
