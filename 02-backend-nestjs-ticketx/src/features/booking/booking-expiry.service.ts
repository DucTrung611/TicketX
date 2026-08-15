import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingRepository } from './booking.repository';
import { BookingSeatRepository } from './booking-seat.repository';
import { SeatLockService } from './seat-lock.service';
import { BookingGateway } from './booking.gateway';

/**
 * Sweeps `pending` bookings whose hold has lapsed and marks them `expired`.
 * Required because the DB-level double-booking guard
 * (`uq_booking_seats_showtime_id_seat_id`) only excludes `cancelled`/`expired`
 * rows, so a lapsed `pending` row otherwise blocks its seat forever.
 */
@Injectable()
export class BookingExpiryService {
  private readonly logger = new Logger(BookingExpiryService.name);

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly bookingSeatRepository: BookingSeatRepository,
    private readonly seatLockService: SeatLockService,
    private readonly bookingGateway: BookingGateway,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async expireLapsedBookings(): Promise<void> {
    const expired = await this.bookingRepository.findExpiredPending(new Date());
    if (expired.length === 0) return;

    const ids = expired.map((booking) => booking.id);
    await this.bookingRepository.updateStatusByIds(ids, 'expired');
    await this.bookingSeatRepository.updateStatusByBookingIds(ids, 'expired');

    for (const booking of expired) {
      const seats = await this.bookingSeatRepository.findByBookingId(
        booking.id,
      );
      const seatIds = seats.map((seat) => seat.seatId);
      await this.seatLockService.releaseMany(booking.showtimeId, seatIds);
      for (const seatId of seatIds) {
        this.bookingGateway.emitSeatReleased(booking.showtimeId, seatId);
      }
    }

    this.logger.log(`Expired ${expired.length} lapsed pending booking(s)`);
  }
}
