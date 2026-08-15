import { randomUUID, createHmac, timingSafeEqual } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';

/**
 * Stands in for a real gateway SDK (VNPay/Momo/Stripe). Builds a checkout URL
 * that points back at our own `mock-checkout` page instead of a live sandbox,
 * and signs/verifies webhook payloads with an HMAC instead of each provider's
 * real signing scheme. Swap this out feature-internally once real merchant
 * credentials exist — `PaymentService` only depends on this class's interface.
 */
@Injectable()
export class MockPaymentGatewayService {
  private readonly baseUrl: string;
  private readonly webhookSecret: string;

  constructor(configService: ConfigService<AppConfig>) {
    const app = configService.get('app', { infer: true })!;
    this.baseUrl = app.baseUrl;
    this.webhookSecret = configService.get('payment', {
      infer: true,
    })!.webhookSecret;
  }

  generateTransactionId(): string {
    return `MOCK-${randomUUID()}`;
  }

  buildCheckoutUrl(paymentId: string): string {
    return `${this.baseUrl}/api/v1/payments/mock-checkout/${paymentId}`;
  }

  sign(paymentId: string, resultCode: string): string {
    return createHmac('sha256', this.webhookSecret)
      .update(`${paymentId}:${resultCode}`)
      .digest('hex');
  }

  verify(paymentId: string, resultCode: string, signature: string): boolean {
    const expected = Buffer.from(this.sign(paymentId, resultCode));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  }
}
