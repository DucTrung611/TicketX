import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { SkipTransform } from '../../shared/decorators/skip-transform.decorator';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':bookingId/initiate')
  @UseGuards(JwtAuthGuard)
  initiate(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentService.initiate(currentUser.sub, bookingId, dto);
  }

  @Get(':bookingId')
  @UseGuards(JwtAuthGuard)
  getStatus(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.paymentService.getStatus(currentUser.sub, bookingId);
  }

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  @SkipTransform()
  async webhook(
    @Param('provider') provider: string,
    @Body() dto: PaymentWebhookDto,
  ) {
    const ack = await this.paymentService.handleWebhook(provider, dto);
    return { RspCode: ack.rspCode, Message: ack.message };
  }

  @Get('mock-checkout/:paymentId')
  @SkipTransform()
  @Header('Content-Type', 'text/html; charset=utf-8')
  async mockCheckout(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ): Promise<string> {
    const context = await this.paymentService.getMockCheckoutContext(paymentId);
    if (!context) {
      throw new NotFoundException({
        code: 'PAYMENT_004',
        message: 'Payment not found',
      });
    }

    const { payment, successSignature, failedSignature } = context;
    return renderMockCheckoutPage({
      paymentId: payment.id,
      amount: Number(payment.amount),
      provider: payment.provider,
      status: payment.status,
      successSignature,
      failedSignature,
    });
  }
}

function renderMockCheckoutPage(params: {
  paymentId: string;
  amount: number;
  provider: string;
  status: string;
  successSignature: string;
  failedSignature: string;
}): string {
  const {
    paymentId,
    amount,
    provider,
    status,
    successSignature,
    failedSignature,
  } = params;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>TicketX Mock ${provider} Checkout</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0b0b0f; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; width: 360px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  p.sub { color: #a1a1aa; margin: 0 0 24px; font-size: 13px; }
  .amount { font-size: 28px; font-weight: 600; margin-bottom: 24px; }
  button { width: 100%; padding: 12px; border-radius: 8px; border: none; font-size: 14px; font-weight: 500; cursor: pointer; margin-bottom: 10px; }
  .pay { background: #22c55e; color: #052e12; }
  .fail { background: #27272a; color: #f4f4f5; }
  #result { margin-top: 16px; font-size: 13px; white-space: pre-wrap; }
</style>
</head>
<body>
  <div class="card">
    <h1>TicketX — Mock ${provider.toUpperCase()} Checkout</h1>
    <p class="sub">Payment ${paymentId} · status: ${status}</p>
    <div class="amount">${amount.toLocaleString('vi-VN')} VND</div>
    <button class="pay" onclick="pay('success')">Pay now</button>
    <button class="fail" onclick="pay('failed')">Simulate failure</button>
    <div id="result"></div>
  </div>
  <script>
    async function pay(resultCode) {
      const signature = resultCode === 'success' ? ${JSON.stringify(successSignature)} : ${JSON.stringify(failedSignature)};
      const res = await fetch('/api/v1/payments/webhook/${provider}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: ${JSON.stringify(paymentId)}, resultCode, signature }),
      });
      const body = await res.json();
      document.getElementById('result').textContent = JSON.stringify(body, null, 2);
    }
  </script>
</body>
</html>`;
}
