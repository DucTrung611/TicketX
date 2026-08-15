# Feature: booking

Owns `bookings`, `booking_seats` (see `DATABASE.md` §2 "Feature: Booking"). The
**safety-critical** feature per `CLAUDE.md` — seat holds always go through Redis
*and* the DB partial unique index; never skip the hold step.

## Responsibilities
- `SeatLockService`: the only place touching `ioredis` for this feature. Key
  `seat_lock:{showtimeId}:{seatId}` → value `userId`, TTL = `SEAT_LOCK_TTL_SECONDS`
  (default 600s, `config/configuration.ts` → `booking.seatLockTtlSeconds`)
- `POST /bookings/hold`: validates the showtime is bookable (`scheduled`/`ongoing`) and the
  seats belong to its room (via `ShowtimeService` + `CinemaService.listSeats`, no raw join),
  then acquires a Redis lock per seat. All-or-nothing: if any seat is already locked by
  someone else, the seats acquired earlier in the same call are rolled back
- `POST /bookings`: requires every seat to still be Redis-locked by the caller, then inserts
  `booking` + `booking_seats` (+ `booking_combos`, if `comboItems` given) in one transaction
  (`BookingRepository.createWithSeats`). `uq_booking_seats_showtime_id_seat_id` (partial,
  `WHERE status IN ('pending','confirmed')`) is the DB-level guard backing up the Redis lock —
  a `23505` on that constraint means another request won the race and is mapped to
  `BOOKING_002`; a collision on `uq_bookings_booking_code` (random `TX-{year}-{6 digits}`) just
  retries with a new code (up to 3 attempts). `comboItems` are validated one-by-one via
  `ComboService.getActiveByIdOrThrow` (throws `COMBO_001` if missing/inactive) and summed into
  the subtotal; `voucherCode`, if given, is validated against that subtotal via
  `VoucherService.validateForOrder` (throws `VOUCHER_001` if invalid) and `used_count` is
  incremented only after the booking row is actually persisted. `total_amount = seats subtotal
  + combos subtotal - discount_amount`.
- `POST /bookings/:id/cancel`: owner-only, sets `booking`/`booking_seats` status to
  `cancelled` (frees the partial unique index) and releases the Redis locks
- `GET /bookings/:id/ticket`: only for `confirmed` bookings — returns a QR **payload** string
  (`TICKETX:{id}:{bookingCode}`), not a rendered image; a client renders it into a QR code
- `POST /bookings/:id/checkin`: staff/admin only, requires `confirmed` + not already checked in
- `BookingGateway` (`/showtimes` Socket.io namespace): broadcasts `seat:locked` /
  `seat:released` / `seat:booked` to room `showtime:{id}`. Connection is authenticated via
  `handshake.auth.token` (a JWT access token), manually verified in `handleConnection`
  since Socket.io's handshake isn't a normal HTTP request `JwtAuthGuard` can attach to.
  Payloads never include the locking user's identity, per `API_SPEC.md` §8.

## Not yet wired (documented gaps, revisit when the feature lands)
- **Payment**: nothing currently transitions a booking from `pending` → `confirmed`, emits
  `seat:booked`, or deletes the Redis lock on success — that's `POST /payments/webhook/:provider`'s
  job once `features/payment` exists (see `API_SPEC.md` §7)
- **Expiry**: `bookings.expires_at` is set on creation but nothing sweeps expired `pending`
  bookings to `expired` — needs a scheduled job once introduced
- `GET /showtimes/:id/seats` (owned by `features/showtime`) still reports every seat as
  `available` — it doesn't yet merge in Redis locks or `booking_seats`. That merge is this
  feature's responsibility once combo/voucher/payment stabilize the write path.

## Error codes
| Code | HTTP | Meaning |
|---|---|---|
| `BOOKING_001` | 404 | Seat not found (doesn't belong to the showtime's room) |
| `BOOKING_002` | 409 | Seat is locked by another user / lock expired / already booked |
| `BOOKING_003` | 409 | Showtime is not available for booking (cancelled/ended) |
| `BOOKING_004` | 404 | Booking not found (or not owned by the caller) |
| `BOOKING_005` | 409 | Booking cannot be cancelled in its current state |
| `BOOKING_006` | 409 | Ticket is only available for confirmed bookings |
| `BOOKING_007` | 409 | Only confirmed bookings can be checked in |
| `BOOKING_008` | 409 | Booking already checked in |
