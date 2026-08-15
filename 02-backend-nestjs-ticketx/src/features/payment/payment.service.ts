import {
  BadGatewayException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { BookingService } from '../booking/booking.service';
import { PaymentRepository } from './payment.repository';
import { MockPaymentGatewayService } from './mock-payment-gateway.service';
import { Payment } from './entities/payment.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import {
  PaymentInitiateResponseDto,
  PaymentStatusResponseDto,
} from './dto/payment-response.dto';

export interface WebhookAck {
  rspCode: string;
  message: string;
}

const SUPPORTED_PROVIDERS = new Set(['vnpay']);

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly bookingService: BookingService,
    private readonly gateway: MockPaymentGatewayService,
  ) {}

  async initiate(
    userId: string,
    bookingId: string,
    dto: InitiatePaymentDto,
  ): Promise<PaymentInitiateResponseDto> {
    const booking = await this.bookingService.getByIdOrThrow(userId, bookingId);

    if (new Date() > booking.expiresAt) {
      throw new ConflictException({
        code: 'BOOKING_003',
        message: 'Booking has expired',
      });
    }
    if (booking.status !== 'pending') {
      throw new ConflictException({
        code: 'PAYMENT_003',
        message: 'Booking is not awaiting payment',
      });
    }
    if (!SUPPORTED_PROVIDERS.has(dto.provider)) {
      throw new BadGatewayException({
        code: 'PAYMENT_001',
        message: `Provider "${dto.provider}" is not available`,
      });
    }

    const payment = await this.paymentRepository.create({
      bookingId,
      provider: dto.provider,
      providerTransactionId: this.gateway.generateTransactionId(),
      amount: booking.totalAmount.toFixed(2),
      status: 'pending',
    });

    return {
      provider: dto.provider,
      paymentUrl: this.gateway.buildCheckoutUrl(payment.id),
      amount: booking.totalAmount,
    };
  }

  async getStatus(
    userId: string,
    bookingId: string,
  ): Promise<PaymentStatusResponseDto | null> {
    await this.bookingService.getByIdOrThrow(userId, bookingId);
    const payment =
      await this.paymentRepository.findLatestByBookingId(bookingId);
    return payment ? this.toStatusResponseDto(payment) : null;
  }

  async getMockCheckoutContext(paymentId: string): Promise<{
    payment: Payment;
    successSignature: string;
    failedSignature: string;
  } | null> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) return null;
    return {
      payment,
      successSignature: this.gateway.sign(payment.id, 'success'),
      failedSignature: this.gateway.sign(payment.id, 'failed'),
    };
  }

  /**
   * Never throws — a gateway webhook must always get back a well-formed ack in
   * its own format, even for "this failed" outcomes (invalid signature, unknown
   * payment, replay). See `API_SPEC.md` §7.
   */
  async handleWebhook(
    provider: string,
    dto: PaymentWebhookDto,
  ): Promise<WebhookAck> {
    if (!SUPPORTED_PROVIDERS.has(provider)) {
      return { rspCode: '99', message: 'Unsupported provider' };
    }

    const payment = await this.paymentRepository.findById(dto.paymentId);
    if (!payment) {
      return { rspCode: '01', message: 'Payment not found' };
    }

    if (!this.gateway.verify(dto.paymentId, dto.resultCode, dto.signature)) {
      this.logger.warn(
        `Rejected webhook for payment ${dto.paymentId}: bad signature`,
      );
      return { rspCode: '97', message: 'Invalid signature' };
    }

    if (payment.status !== 'pending') {
      return { rspCode: '02', message: 'Order already confirmed' };
    }

    if (dto.resultCode === 'failed') {
      payment.status = 'failed';
      await this.paymentRepository.save(payment);
      return { rspCode: '00', message: 'Confirm Success' };
    }

    payment.status = 'success';
    payment.paidAt = new Date();
    await this.paymentRepository.save(payment);

    try {
      await this.bookingService.confirmBooking(payment.bookingId);
    } catch (error) {
      this.logger.error(
        `Payment ${payment.id} marked success but booking ${payment.bookingId} confirmation failed`,
        error instanceof Error ? error.stack : error,
      );
    }

    return { rspCode: '00', message: 'Confirm Success' };
  }

  private toStatusResponseDto(payment: Payment): PaymentStatusResponseDto {
    return {
      id: payment.id,
      bookingId: payment.bookingId,
      provider: payment.provider,
      status: payment.status,
      amount: Number(payment.amount),
      paidAt: payment.paidAt,
    };
  }
}
