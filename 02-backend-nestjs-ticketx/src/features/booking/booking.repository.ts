import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingSeat } from './entities/booking-seat.entity';
import { BookingCombo } from './entities/booking-combo.entity';
import type { BookingStatus } from './types/booking.types';

export interface CreateBookingSeatInput {
  seatId: string;
  price: string;
}

export interface CreateBookingComboInput {
  comboId: string;
  quantity: number;
  price: string;
}

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repo: Repository<Booking>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  findById(id: string): Promise<Booking | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Booking | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  async findAndCountByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<[Booking[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  /**
   * Inserts the booking and its seats in one transaction. The partial unique
   * index `uq_booking_seats_showtime_id_seat_id` is the DB-level guard against
   * double-booking a seat — a 23505 here means another request won the race.
   */
  async createWithSeats(
    bookingData: Partial<Booking>,
    seats: CreateBookingSeatInput[],
    combos: CreateBookingComboInput[] = [],
  ): Promise<Booking> {
    return this.dataSource.transaction(async (manager) => {
      const booking = manager.create(Booking, bookingData);
      await manager.save(booking);

      const bookingSeats = seats.map((seat) =>
        manager.create(BookingSeat, {
          bookingId: booking.id,
          showtimeId: booking.showtimeId,
          seatId: seat.seatId,
          price: seat.price,
          status: booking.status,
        }),
      );
      await manager.save(bookingSeats);

      if (combos.length > 0) {
        const bookingCombos = combos.map((combo) =>
          manager.create(BookingCombo, {
            bookingId: booking.id,
            comboId: combo.comboId,
            quantity: combo.quantity,
            price: combo.price,
          }),
        );
        await manager.save(bookingCombos);
      }

      return booking;
    });
  }

  save(booking: Booking): Promise<Booking> {
    return this.repo.save(booking);
  }

  /**
   * Finds `pending` bookings whose hold has lapsed. Used by the expiry sweep —
   * without this, a lapsed `pending` row keeps blocking its seat forever via
   * `uq_booking_seats_showtime_id_seat_id`, since that index only excludes
   * `cancelled`/`expired` rows, not merely-late ones.
   */
  findExpiredPending(now: Date): Promise<Booking[]> {
    return this.repo
      .createQueryBuilder('booking')
      .where('booking.status = :status', { status: 'pending' })
      .andWhere('booking.expires_at < :now', { now })
      .getMany();
  }

  async updateStatusByIds(ids: string[], status: BookingStatus): Promise<void> {
    if (ids.length === 0) return;
    await this.repo
      .createQueryBuilder()
      .update(Booking)
      .set({ status })
      .where('id IN (:...ids)', { ids })
      .execute();
  }
}
