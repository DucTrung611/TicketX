import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingSeat } from './entities/booking-seat.entity';
import type { BookingStatus } from './types/booking.types';

@Injectable()
export class BookingSeatRepository {
  constructor(
    @InjectRepository(BookingSeat)
    private readonly repo: Repository<BookingSeat>,
  ) {}

  findByBookingId(bookingId: string): Promise<BookingSeat[]> {
    return this.repo.find({ where: { bookingId } });
  }

  /**
   * Seats already claimed for a showtime — mirrors the `pending`/`confirmed`
   * scope of `uq_booking_seats_showtime_id_seat_id`, so this stays in sync
   * with what the DB actually blocks a second booking on.
   */
  async findTakenSeatIds(showtimeId: string): Promise<string[]> {
    const rows = await this.repo.find({
      where: [
        { showtimeId, status: 'pending' },
        { showtimeId, status: 'confirmed' },
      ],
      select: ['seatId'],
    });
    return rows.map((row) => row.seatId);
  }

  async updateStatusByBookingId(
    bookingId: string,
    status: BookingStatus,
  ): Promise<void> {
    await this.repo.update({ bookingId }, { status });
  }

  async updateStatusByBookingIds(
    bookingIds: string[],
    status: BookingStatus,
  ): Promise<void> {
    if (bookingIds.length === 0) return;
    await this.repo
      .createQueryBuilder()
      .update(BookingSeat)
      .set({ status })
      .where('booking_id IN (:...bookingIds)', { bookingIds })
      .execute();
  }
}
