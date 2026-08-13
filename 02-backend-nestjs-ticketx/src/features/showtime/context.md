# Feature: showtime

Owns `showtimes` (see `DATABASE.md` §2 "Feature: Showtime"). No junction/child tables of its
own yet — `booking_seats` (owned by `features/booking`, not built yet) will later read
`showtimes.base_price` and seat data through this feature's/cinema's exported services.

## Responsibilities
- Showtime CRUD (admin-only write, public read), filtered by `movieId`, `cinemaId` (resolved
  to room ids via `CinemaService.listRooms`, never a raw join into `rooms`), `date`
- Overlap guard: a room can't have two non-cancelled showtimes with intersecting time ranges
- `GET /showtimes/:id/seats`: merges the room's static seat layout (via
  `CinemaService.listSeats`) with live availability — **currently always `available`**,
  since `features/booking` (Redis seat locks + `booking_seats`) doesn't exist yet. This is the
  integration point that must be revisited once booking lands (see `API_SPEC.md` §6 note:
  "DB + Redis lock state merged")
- Cross-feature reads go through `MovieService.getByIdOrThrow` and `CinemaService` only —
  no direct import of `movie`/`cinema` entities or repositories

## Error codes
| Code | HTTP | Meaning |
|---|---|---|
| `SHOWTIME_001` | 404 | Showtime not found |
| `SHOWTIME_002` | 400 | `endTime` is not after `startTime` |
| `SHOWTIME_003` | 409 | Room already has an overlapping showtime |

## Key decisions
- `DELETE /showtimes/:id` does a soft cancel (`status = 'cancelled'`), not a hard delete —
  matches API_SPEC's "Cancel showtime" wording and keeps history for any future
  booking/refund logic
- `base_price` stored as Postgres `numeric`, mapped to a JS `string` on the entity (TypeORM
  default) and converted to `number` only in the response DTO, to avoid float precision loss
