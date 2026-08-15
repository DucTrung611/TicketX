import { randomInt } from 'crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueryFailedError } from 'typeorm';
import { AppConfig } from '../../config/configuration';
import { PaginatedResult } from '../../shared/types/paginated-result.type';
import { buildPaginationMeta } from '../../shared/utils/pagination.util';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import { ShowtimeService } from '../showtime/showtime.service';
import { CinemaService } from '../cinema/cinema.service';
import { ComboService } from '../combo/combo.service';
import { VoucherService } from '../voucher/voucher.service';
import { SeatLockService } from './seat-lock.service';
import { BookingRepository } from './booking.repository';
import type { CreateBookingComboInput } from './booking.repository';
import { BookingSeatRepository } from './booking-seat.repository';
import { BookingComboRepository } from './booking-combo.repository';
import { BookingGateway } from './booking.gateway';
import { Booking } from './entities/booking.entity';
import { BookingCombo } from './entities/booking-combo.entity';
import { HoldSeatsDto } from './dto/hold-seats.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { HoldResponseDto } from './dto/hold-response.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';

const ACTIVE_STATUSES = new Set(['pending', 'confirmed']);

@Injectable()
export class BookingService {
  private readonly seatLockTtlSeconds: number;

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly bookingSeatRepository: BookingSeatRepository,
    private readonly bookingComboRepository: BookingComboRepository,
    private readonly seatLockService: SeatLockService,
    private readonly showtimeService: ShowtimeService,
    private readonly cinemaService: CinemaService,
    private readonly comboService: ComboService,
    private readonly voucherService: VoucherService,
    private readonly bookingGateway: BookingGateway,
    private readonly eventEmitter: EventEmitter2,
    configService: ConfigService<AppConfig>,
  ) {
    this.seatLockTtlSeconds = configService.get('booking', {
      infer: true,
    })!.seatLockTtlSeconds;
  }

  async hold(userId: string, dto: HoldSeatsDto): Promise<HoldResponseDto> {
    const showtime = await this.showtimeService.getByIdOrThrow(dto.showtimeId);
    this.assertBookable(showtime.status);
    await this.assertSeatsBelongToShowtime(showtime.roomId, dto.seatIds);

    const acquired: string[] = [];
    for (const seatId of dto.seatIds) {
      const ok = await this.seatLockService.acquire(
        dto.showtimeId,
        seatId,
        userId,
        this.seatLockTtlSeconds,
      );
      if (!ok) break;
      acquired.push(seatId);
    }

    if (acquired.length !== dto.seatIds.length) {
      for (const seatId of acquired) {
        await this.seatLockService.release(dto.showtimeId, seatId);
      }
      throw new ConflictException({
        code: 'BOOKING_002',
        message: 'One or more seats are locked by another user',
      });
    }

    const expiresAt = new Date(Date.now() + this.seatLockTtlSeconds * 1000);
    for (const seatId of dto.seatIds) {
      this.bookingGateway.emitSeatLocked(dto.showtimeId, seatId, expiresAt);
    }

    return { lockedSeats: dto.seatIds, expiresAt };
  }

  async create(
    userId: string,
    dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const showtime = await this.showtimeService.getByIdOrThrow(dto.showtimeId);
    this.assertBookable(showtime.status);

    for (const seatId of dto.seatIds) {
      const owned = await this.seatLockService.isOwnedBy(
        dto.showtimeId,
        seatId,
        userId,
      );
      if (!owned) {
        throw new ConflictException({
          code: 'BOOKING_002',
          message: 'Seat hold expired or not owned by caller',
        });
      }
    }

    const pricePerSeat = showtime.basePrice;
    const seatsSubtotal = Number(pricePerSeat) * dto.seatIds.length;

    const comboInputs: CreateBookingComboInput[] = [];
    let combosSubtotal = 0;
    if (dto.comboItems && dto.comboItems.length > 0) {
      for (const item of dto.comboItems) {
        const combo = await this.comboService.getActiveByIdOrThrow(
          item.comboId,
        );
        combosSubtotal += combo.price * item.quantity;
        comboInputs.push({
          comboId: item.comboId,
          quantity: item.quantity,
          price: combo.price.toFixed(2),
        });
      }
    }

    const subtotal = seatsSubtotal + combosSubtotal;

    let discountAmount = 0;
    if (dto.voucherCode) {
      const validation = await this.voucherService.validateForOrder(
        dto.voucherCode,
        subtotal,
      );
      discountAmount = validation.discountAmount;
    }

    const totalAmount = (subtotal - discountAmount).toFixed(2);
    const expiresAt = new Date(Date.now() + this.seatLockTtlSeconds * 1000);

    let booking: Booking | undefined;
    for (let attempt = 0; attempt < 3 && !booking; attempt++) {
      try {
        booking = await this.bookingRepository.createWithSeats(
          {
            userId,
            showtimeId: dto.showtimeId,
            bookingCode: this.generateBookingCode(),
            status: 'pending',
            voucherCode: dto.voucherCode ?? null,
            discountAmount: discountAmount.toFixed(2),
            totalAmount,
            expiresAt,
          },
          dto.seatIds.map((seatId) => ({ seatId, price: pricePerSeat })),
          comboInputs,
        );
      } catch (error) {
        const constraint = this.constraintNameOf(error);
        if (constraint === 'uq_bookings_booking_code') {
          continue;
        }
        if (constraint === 'uq_booking_seats_showtime_id_seat_id') {
          throw new ConflictException({
            code: 'BOOKING_002',
            message: 'One or more seats were already booked',
          });
        }
        throw error;
      }
    }

    if (!booking) {
      throw new ConflictException({
        code: 'BOOKING_002',
        message: 'Could not generate a unique booking code, please retry',
      });
    }

    if (dto.voucherCode) {
      await this.voucherService.incrementUsage(dto.voucherCode);
    }

    return this.toResponseDto(booking, dto.seatIds, comboInputs);
  }

  async list(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<BookingResponseDto>> {
    const [bookings, total] = await this.bookingRepository.findAndCountByUserId(
      userId,
      query.page,
      query.limit,
    );

    const items = await Promise.all(
      bookings.map(async (booking) => {
        const [seats, combos] = await Promise.all([
          this.bookingSeatRepository.findByBookingId(booking.id),
          this.bookingComboRepository.findByBookingId(booking.id),
        ]);
        return this.toResponseDto(
          booking,
          seats.map((seat) => seat.seatId),
          combos,
        );
      }),
    );

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  }

  async getByIdOrThrow(
    userId: string,
    id: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.getOwnedBookingOrThrow(userId, id);
    const [seats, combos] = await Promise.all([
      this.bookingSeatRepository.findByBookingId(booking.id),
      this.bookingComboRepository.findByBookingId(booking.id),
    ]);
    return this.toResponseDto(
      booking,
      seats.map((seat) => seat.seatId),
      combos,
    );
  }

  async cancel(userId: string, id: string): Promise<void> {
    const booking = await this.getOwnedBookingOrThrow(userId, id);
    if (!ACTIVE_STATUSES.has(booking.status)) {
      throw new ConflictException({
        code: 'BOOKING_005',
        message: 'Booking cannot be cancelled in its current state',
      });
    }

    const seats = await this.bookingSeatRepository.findByBookingId(booking.id);

    booking.status = 'cancelled';
    await this.bookingRepository.save(booking);
    await this.bookingSeatRepository.updateStatusByBookingId(
      booking.id,
      'cancelled',
    );

    const seatIds = seats.map((seat) => seat.seatId);
    await this.seatLockService.releaseMany(booking.showtimeId, seatIds);
    for (const seatId of seatIds) {
      this.bookingGateway.emitSeatReleased(booking.showtimeId, seatId);
    }
  }

  /**
   * Transitions a `pending` booking to `confirmed` after a successful payment.
   * Called by `features/payment`'s webhook handler — idempotent, since gateways
   * may retry webhook delivery.
   */
  async confirmBooking(bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_004',
        message: 'Booking not found',
      });
    }
    if (booking.status === 'confirmed') {
      return;
    }
    if (booking.status !== 'pending') {
      throw new ConflictException({
        code: 'BOOKING_005',
        message: 'Booking cannot be confirmed in its current state',
      });
    }

    booking.status = 'confirmed';
    await this.bookingRepository.save(booking);
    await this.bookingSeatRepository.updateStatusByBookingId(
      booking.id,
      'confirmed',
    );

    const seats = await this.bookingSeatRepository.findByBookingId(booking.id);
    const seatIds = seats.map((seat) => seat.seatId);
    await this.seatLockService.releaseMany(booking.showtimeId, seatIds);
    for (const seatId of seatIds) {
      this.bookingGateway.emitSeatBooked(booking.showtimeId, seatId);
    }

    this.eventEmitter.emit('booking.confirmed', {
      bookingId: booking.id,
      userId: booking.userId,
      showtimeId: booking.showtimeId,
    });
  }

  async getTicket(userId: string, id: string): Promise<TicketResponseDto> {
    const booking = await this.getOwnedBookingOrThrow(userId, id);
    if (booking.status !== 'confirmed') {
      throw new ConflictException({
        code: 'BOOKING_006',
        message: 'Ticket is only available for confirmed bookings',
      });
    }

    return {
      bookingCode: booking.bookingCode,
      qrPayload: `TICKETX:${booking.id}:${booking.bookingCode}`,
    };
  }

  async checkin(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_004',
        message: 'Booking not found',
      });
    }
    if (booking.status !== 'confirmed') {
      throw new ConflictException({
        code: 'BOOKING_007',
        message: 'Only confirmed bookings can be checked in',
      });
    }
    if (booking.checkedInAt) {
      throw new ConflictException({
        code: 'BOOKING_008',
        message: 'Booking already checked in',
      });
    }

    booking.checkedInAt = new Date();
    await this.bookingRepository.save(booking);

    const [seats, combos] = await Promise.all([
      this.bookingSeatRepository.findByBookingId(booking.id),
      this.bookingComboRepository.findByBookingId(booking.id),
    ]);
    return this.toResponseDto(
      booking,
      seats.map((seat) => seat.seatId),
      combos,
    );
  }

  private async getOwnedBookingOrThrow(
    userId: string,
    id: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findByIdAndUserId(id, userId);
    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_004',
        message: 'Booking not found',
      });
    }
    return booking;
  }

  private assertBookable(showtimeStatus: string): void {
    if (showtimeStatus !== 'scheduled' && showtimeStatus !== 'ongoing') {
      throw new ConflictException({
        code: 'BOOKING_003',
        message: 'Showtime is not available for booking',
      });
    }
  }

  private async assertSeatsBelongToShowtime(
    roomId: string,
    seatIds: string[],
  ): Promise<void> {
    const seats = await this.cinemaService.listSeats(roomId);
    const validSeatIds = new Set(seats.map((seat) => seat.id));
    const invalid = seatIds.find((seatId) => !validSeatIds.has(seatId));
    if (invalid) {
      throw new NotFoundException({
        code: 'BOOKING_001',
        message: `Seat ${invalid} not found`,
      });
    }
  }

  private generateBookingCode(): string {
    const year = new Date().getFullYear();
    const suffix = randomInt(0, 1_000_000).toString().padStart(6, '0');
    return `TX-${year}-${suffix}`;
  }

  private constraintNameOf(error: unknown): string | undefined {
    if (error instanceof QueryFailedError) {
      return (error as unknown as { constraint?: string }).constraint;
    }
    return undefined;
  }

  private toResponseDto(
    booking: Booking,
    seatIds: string[],
    combos: (BookingCombo | CreateBookingComboInput)[] = [],
  ): BookingResponseDto {
    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      status: booking.status,
      showtimeId: booking.showtimeId,
      seatIds,
      comboItems: combos.map((combo) => ({
        comboId: combo.comboId,
        quantity: combo.quantity,
        price: Number(combo.price),
      })),
      discountAmount: Number(booking.discountAmount),
      totalAmount: Number(booking.totalAmount),
      expiresAt: booking.expiresAt,
      checkedInAt: booking.checkedInAt,
    };
  }
}
