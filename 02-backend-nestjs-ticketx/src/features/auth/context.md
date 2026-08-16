# Feature: auth

Owns the `/auth/*` endpoints in `API_SPEC.md` §6 "Auth & User". Does not own any table —
`users` is owned by `features/user`; auth only issues/rotates tokens.

## Responsibilities
- Register/login: delegates user creation + password verification to `UserService`
- Access token (JWT, 15m, signed with `JWT_ACCESS_SECRET`) — validated by the global
  `JwtStrategy` (`shared/strategies/jwt.strategy.ts`), consumed by `JwtAuthGuard`
- Refresh token (JWT, 7d, signed with `JWT_REFRESH_SECRET`, carries a `jti`) — rotated on
  every use; old `jti` is pushed to `RefreshTokenService`'s Redis blocklist
  (`refresh_blocklist:{jti}`, TTL = remaining token validity), per `API_SPEC.md` §2
- Forgot/reset password: `OtpService` issues a 6-digit OTP (hashed with bcrypt, stored in
  Redis at `otp:{email}`, TTL `OTP_TTL_SECONDS`, default 5 min) on `POST /auth/forgot-password`,
  emailed via `MailService` (`core/mail`); `POST /auth/reset-password` verifies it and
  delegates the actual password write to `UserService.resetPassword`

## Error codes (this feature)
| Code | HTTP | Meaning |
|---|---|---|
| `AUTH_001` | 401 | Invalid email/password, or disabled account |
| `AUTH_002` | 401 | Refresh token revoked / invalid / expired |
| `AUTH_005` | 401 | Invalid Google credential |
| `AUTH_006` | 400 | OTP invalid, expired, or attempt cap exceeded |
| `AUTH_007` | 429 | OTP cooldown active (`OTP_COOLDOWN_SECONDS`, default 60s) |

## Key decisions
- `RefreshTokenService` and `OtpService` are the only places that touch `ioredis` directly
  for this feature (PROJECT-RULES.md §8 "Redis access wrapped in a feature-owned service")
- `JwtStrategy` lives in `shared/` (registered by `SharedModule`, not here) because both
  `auth` and `user` controllers use `JwtAuthGuard`
- OTP is Redis-only, never persisted to Postgres — same ephemeral-primitive approach as the
  booking feature's seat lock (`DATABASE.md` §6)
- `forgot-password` always returns the same `200` message and always starts the cooldown,
  whether or not the email is registered — otherwise the endpoint would leak account
  existence via timing/429 behavior across repeated calls
- OTP verification caps attempts at `OTP_MAX_ATTEMPTS` (default 5) and is one-time-use —
  a successful or exhausted verification deletes the Redis key
