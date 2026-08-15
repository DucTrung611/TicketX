# Feature: combo

Owns `combos` (see `DATABASE.md` §2 "Feature: Combo"). `booking_combos` is owned
and persisted by `features/booking` (it's the booking side of the combo
purchase, same as `booking_seats` for showtimes) — this feature only owns the
combo catalog itself.

## Responsibilities
- `GET /combos`: public, lists only `is_active = true` combos (matches the
  API_SPEC.md §6 wording "List active combos" — admins wanting inactive combos
  too is not in scope yet).
- `POST /combos` / `PATCH /combos/:id`: admin-only catalog management.
- `ComboService.getActiveByIdOrThrow(id)`: the only entry point other features
  may use (see `features/booking`'s `create()`) — returns a `ComboResponseDto`,
  never the raw entity, and throws `COMBO_001` if the combo doesn't exist or
  has been deactivated. Never import `ComboRepository`/`Combo` entity outside
  this feature.

## Error codes
| Code | HTTP | Meaning |
|---|---|---|
| `COMBO_001` | 404 | Combo not found or inactive |
