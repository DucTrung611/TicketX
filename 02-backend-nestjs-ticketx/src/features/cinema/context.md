# Feature: cinema

Owns `cinemas`, `rooms`, `seats` (see `DATABASE.md` §2 "Feature: Cinema").

## Responsibilities
- Cinema CRUD (list/detail public, create admin-only)
- Room list/create under a cinema
- Seat bulk-create under a room; keeps `rooms.total_seats` (denormalized) in sync after
  every bulk insert
- Two controllers because the URL space crosses the `cinemas`/`rooms` prefix boundary:
  `CinemaController` (`/cinemas`, `/cinemas/:id/rooms`) and `RoomController`
  (`/rooms/:id/seats`) — both share the same `CinemaService`

## Error codes
| Code | HTTP | Meaning |
|---|---|---|
| `CINEMA_001` | 404 | Cinema not found |
| `CINEMA_002` | 404 | Room not found |
| `CINEMA_003` | 409 | One or more seats already exist in this room (`uq_seats_room_id_seat_row_seat_number`) |

## Key decisions
- Seat uniqueness (`room_id` + `seat_row` + `seat_number`) is enforced at the DB level;
  the service catches the resulting `23505` and rethrows as `CINEMA_003` instead of a raw 500
  (same pattern as `features/movie`'s `MOVIE_003` for FK violations)
