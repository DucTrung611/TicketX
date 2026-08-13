# Feature: user

Owns the `users` table (see `DATABASE.md` §2 "Feature: User").

## Responsibilities
- User entity + persistence (`UserRepository`)
- Profile read/update, password change
- Password hashing (bcrypt) — the only place `passwordHash` is set/verified
- Exposes `UserService` for `auth` feature to create/find users and verify credentials

## Not owned here
- Login/token issuance — see `features/auth` (`AUTH_ENDPOINTS` in `API_SPEC.md` §6 live under `/auth/*` but token logic is `auth`'s)
