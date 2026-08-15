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
