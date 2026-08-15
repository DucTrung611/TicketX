# Feature: voucher

Owns `vouchers` (see `DATABASE.md` §2 "Feature: Voucher").

## Responsibilities
- `POST /vouchers/validate`: any authenticated user; checks a code against an
  order amount (existence, `valid_from`/`valid_to` window, `usage_limit` vs
  `used_count`, `min_order_amount`) and returns the computed discount. Always
  either 200 with `valid: true` or throws `VOUCHER_001` (409) — never returns
  `valid: false`, since an invalid voucher is a business-state conflict.
- `POST /vouchers`, `GET /vouchers`: admin-only.
- `VoucherService.validateForOrder(code, orderAmount)` / `incrementUsage(code)`:
  the two entry points `features/booking` uses when `POST /bookings` receives a
  `voucherCode` — validate against the seats+combos subtotal before persisting
  the booking, then increment usage only after the booking is actually saved
  (so a failed booking attempt never burns a redemption).

## Error codes
| Code | HTTP | Meaning |
|---|---|---|
| `VOUCHER_001` | 409 | Voucher not found / expired / usage limit reached / min order not met |
| `VOUCHER_002` | 409 | A voucher with this code already exists (create) |
