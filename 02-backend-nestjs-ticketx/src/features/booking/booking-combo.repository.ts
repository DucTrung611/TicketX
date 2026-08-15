import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingCombo } from './entities/booking-combo.entity';

@Injectable()
export class BookingComboRepository {
  constructor(
    @InjectRepository(BookingCombo)
    private readonly repo: Repository<BookingCombo>,
  ) {}

  findByBookingId(bookingId: string): Promise<BookingCombo[]> {
    return this.repo.find({ where: { bookingId } });
  }
}
