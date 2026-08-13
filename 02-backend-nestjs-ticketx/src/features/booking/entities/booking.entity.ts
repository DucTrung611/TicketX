import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { BookingStatus } from '../types/booking.types';

@Entity('bookings')
@Index('idx_bookings_user_id_created_at', ['userId', 'createdAt'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'showtime_id', type: 'uuid' })
  showtimeId: string;

  @Index('uq_bookings_booking_code', { unique: true })
  @Column({ name: 'booking_code', type: 'varchar', unique: true })
  bookingCode: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'expired'],
    default: 'pending',
  })
  status: BookingStatus;

  @Column({ name: 'voucher_code', type: 'varchar', nullable: true })
  voucherCode: string | null;

  @Column({
    name: 'discount_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount: string;

  @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2 })
  totalAmount: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'checked_in_at', type: 'timestamptz', nullable: true })
  checkedInAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
