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
  * { box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: radial-gradient(circle at 50% 0%, #1a1a2e, #0b0b0f 60%); color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; width: 360px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
  .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #a1a1aa; background: #27272a; padding: 4px 10px; border-radius: 999px; margin-bottom: 14px; }
  h1 { font-size: 16px; font-weight: 600; margin: 0 0 4px; }
  p.sub { color: #71717a; margin: 0 0 20px; font-size: 12px; font-family: ui-monospace, monospace; }
  .amount-label { font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .amount { font-size: 32px; font-weight: 700; margin-bottom: 28px; letter-spacing: -0.02em; }
  button { width: 100%; padding: 13px; border-radius: 999px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 10px; transition: transform 150ms ease, opacity 150ms ease; }
  button:hover:not(:disabled) { transform: translateY(-1px); }
  button:disabled { cursor: not-allowed; opacity: 0.6; transform: none; }
  .pay { background: #22c55e; color: #052e12; }
  .fail { background: transparent; color: #a1a1aa; border: 1px solid #3f3f46; }
  #result { margin-top: 16px; font-size: 12px; white-space: pre-wrap; font-family: ui-monospace, monospace; color: #71717a; }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">Mock gateway · ${status}</span>
    <h1>TicketX — Mock ${provider.toUpperCase()} Checkout</h1>
    <p class="sub">Payment ${paymentId}</p>
    <div class="amount-label">Số tiền</div>
    <div class="amount">${amount.toLocaleString('vi-VN')} VND</div>
    <button class="pay" id="pay-btn" onclick="pay('success')">Pay now</button>
    <button class="fail" id="fail-btn" onclick="pay('failed')">Simulate failure</button>
    <div id="result"></div>
  </div>
  <script>
    async function pay(resultCode) {
      const payBtn = document.getElementById('pay-btn');
      const failBtn = document.getElementById('fail-btn');
      payBtn.disabled = true;
      failBtn.disabled = true;
      const originalLabel = payBtn.textContent;
      if (resultCode === 'success') payBtn.textContent = 'Processing…';
      const signature = resultCode === 'success' ? ${JSON.stringify(successSignature)} : ${JSON.stringify(failedSignature)};
      try {
        const res = await fetch('/api/v1/payments/webhook/${provider}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: ${JSON.stringify(paymentId)}, resultCode, signature }),
        });
        const body = await res.json();
        document.getElementById('result').textContent = JSON.stringify(body, null, 2);
      } finally {
        payBtn.disabled = false;
        failBtn.disabled = false;
        payBtn.textContent = originalLabel;
      }
    }
  </script>
</body>
</html>`;
}
