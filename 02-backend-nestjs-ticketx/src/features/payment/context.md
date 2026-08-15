# Feature: payment

Owns `payments` (see `DATABASE.md` §2 "Feature: Payment"). Depends on `features/booking`'s
exported `BookingService` (`getByIdOrThrow` for ownership/status checks, `confirmBooking` to
flip a booking to `confirmed` on successful payment) — never touches booking's tables directly.

## `MockPaymentGatewayService` — read this before wiring a real gateway
No real VNPay/Momo/Stripe credentials exist for this project, so `MockPaymentGatewayService`
stands in for a real gateway SDK:
- `POST /payments/:bookingId/initiate` returns a `paymentUrl` pointing at this API's own
  `GET /payments/mock-checkout/:paymentId` page (plain HTML + inline JS) instead of a live
  sandbox URL — open it in a browser to "pay" and watch the booking flip to `confirmed`
- Webhook signing uses `HMAC-SHA256(PAYMENT_WEBHOOK_SECRET, "{paymentId}:{resultCode}")`
  instead of each provider's real checksum scheme
- Only `provider: "vnpay"` is wired to anything real; `momo`/`stripe` are accepted by the DTO
  (matches the DB enum) but `initiate` returns `PAYMENT_001` (502) for them — extend
  `SUPPORTED_PROVIDERS` in `payment.service.ts` and add a matching gateway implementation
  when real credentials for another provider arrive

`PaymentService` only depends on `MockPaymentGatewayService`'s method signatures
(`generateTransactionId`, `buildCheckoutUrl`, `sign`, `verify`) — swapping in a real SDK is a
feature-internal change, not a `PaymentService` rewrite.

## Responsibilities
- `POST /payments/:bookingId/initiate`: guards booking ownership + `pending` status + not
  expired, creates a `payments` row (`status: pending`), returns the checkout URL
- `POST /payments/webhook/:provider`: **exempt from the `{success,data}` envelope** — uses
  `@SkipTransform()` (`shared/decorators/skip-transform.decorator.ts`, checked by
  `TransformInterceptor`) and returns the gateway's own ack shape
  (`{ RspCode, Message }`, VNPay's convention). **Never throws** — every failure mode
  (unsupported provider, unknown payment, bad signature, replay) returns a normal ack with a
  non-`"00"` `RspCode` instead of an HTTP error, because a webhook caller is a gateway, not a
  client that understands `AllExceptionsFilter`'s JSON error shape
- On webhook success: marks the payment `success`, calls `BookingService.confirmBooking()`
  (idempotent — releases the Redis seat locks, flips `booking_seats` to `confirmed`, emits
  `seat:booked` over the `/showtimes` WS gateway, emits the `booking.confirmed` domain event
  via `EventEmitter2` per `ARCHITECTURE.md` §5 — nothing subscribes to it yet; that's for a
  future notification feature)
- `GET /payments/:bookingId`: latest payment for a booking, ownership-checked through
  `BookingService.getByIdOrThrow`

## Error codes
| Code | HTTP | Meaning |
|---|---|---|
| `BOOKING_003` | 409 | Booking has expired (reused from `features/booking`) |
| `PAYMENT_001` | 502 | Gateway error / unsupported provider |
| `PAYMENT_002` | — | Reserved for real signature-mismatch-as-HTTP-error use (webhook itself never returns this as an HTTP error — see above) |
| `PAYMENT_003` | 409 | Booking is not awaiting payment (already confirmed/cancelled/expired) |
| `PAYMENT_004` | 404 | Payment not found (mock-checkout page only) |

## Not yet wired
- No scheduled sweep marks stale `pending` payments as `failed`/expired
- `booking.confirmed` event has no listener — wire a notification feature to it when one exists
