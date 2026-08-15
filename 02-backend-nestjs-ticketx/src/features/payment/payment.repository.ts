import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  findById(id: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { id } });
  }

  findLatestByBookingId(bookingId: string): Promise<Payment | null> {
    return this.repo.findOne({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }

  create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.repo.create(data);
    return this.repo.save(payment);
  }

  save(payment: Payment): Promise<Payment> {
    return this.repo.save(payment);
  }
}
