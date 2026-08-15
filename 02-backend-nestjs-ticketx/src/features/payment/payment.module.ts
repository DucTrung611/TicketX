import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './payment.repository';
import { MockPaymentGatewayService } from './mock-payment-gateway.service';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), BookingModule],
  controllers: [PaymentController],
  providers: [PaymentRepository, MockPaymentGatewayService, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
