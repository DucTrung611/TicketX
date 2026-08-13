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

## Key decisions
- `RefreshTokenService` is the only place that touches `ioredis` directly for this feature
  (PROJECT-RULES.md §8 "Redis access wrapped in a feature-owned service")
- `JwtStrategy` lives in `shared/` (registered by `SharedModule`, not here) because both
  `auth` and `user` controllers use `JwtAuthGuard`
