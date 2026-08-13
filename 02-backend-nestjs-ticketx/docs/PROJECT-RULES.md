# TicketX – PROJECT-RULES.md (Backend)

## Tech Stack
- Language: TypeScript
- Framework: NestJS
- ORM: TypeORM (PostgreSQL) + `ioredis` client (Redis, seat locks)

---

## 1. Feature Structure
```
features/booking/
├── booking.controller.ts       # HTTP layer only — no business logic
├── booking.service.ts          # business logic / use cases
├── booking.repository.ts       # wraps TypeORM Repository<Booking>
├── dto/
│   ├── create-booking.dto.ts
│   └── booking-response.dto.ts
├── entities/
│   ├── booking.entity.ts
│   └── booking-seat.entity.ts
├── types/
│   └── booking.types.ts        # enums, internal interfaces
├── booking.service.spec.ts     # unit tests, colocated (Nest convention)
├── booking.module.ts           # declares providers + `exports`
└── context.md                  # what this feature owns, key decisions
```
> e2e tests live outside the feature, in root-level `test/` (see §7).

---

## 2. Naming Conventions
| Item | Convention | Example |
|---|---|---|
| Feature folders | kebab-case, singular domain noun | `booking`, `showtime` |
| Files | kebab-case + `.type.ts` suffix | `create-booking.dto.ts` |
| Classes | PascalCase + suffix matching file | `BookingService`, `CreateBookingDto` |
| Entities | PascalCase, no suffix | `Booking`, `BookingSeat` |
| Methods/functions | camelCase, verb-first | `createBooking()`, `findSeatById()` |
| Variables | camelCase | `seatLockTtl` |
| True constants | UPPER_SNAKE_CASE | `SEAT_LOCK_TTL_SECONDS` |
| Types/Interfaces | PascalCase, no `I` prefix | `BookingStatus`, `SeatLockPayload` |

---

## 3. Feature Rules
- A feature must be runnable/testable in isolation — no hidden coupling.
- **No direct imports** from another feature's internal files (service, repository, entity).
- Cross-feature communication only via:
  - the other feature's **exported service** (through its `Module.exports` + DI)
  - **domain events** (`EventEmitter2`) for fire-and-forget side effects (e.g. `booking.confirmed` → notification feature)
- Shared code location: `src/shared/` (`shared/guards`, `shared/filters`, `shared/interceptors`, `shared/decorators`, `shared/database`).

```ts
// DO — booking feature depends on showtime's public service
constructor(private readonly showtimeService: ShowtimeService) {}

// DON'T — reaching into another feature's repository/entity directly
import { ShowtimeRepository } from '../showtime/showtime.repository';
```

---

## 4. Code Patterns (MUST follow)

**Error handling** — throw Nest `HttpException` subclasses from the **service**; a global filter formats the response.
```ts
// booking.service.ts
if (!seat) throw new NotFoundException('Seat not found');
```

**Validation** — DTOs + `class-validator`, enforced by a global `ValidationPipe`.
```ts
export class CreateBookingDto {
  @IsUUID() showtimeId: string;
  @IsArray() @ArrayNotEmpty() seatIds: string[];
}
```

**Logging** — Nest's built-in `Logger`, scoped per class, no `console.log`.
```ts
private readonly logger = new Logger(BookingService.name);
this.logger.log(`Booking ${id} confirmed`);
```

**Response format** — consistent envelope via a global `TransformInterceptor`:
```json
{ "success": true, "data": { "id": "..." } }
{ "success": false, "error": { "code": "SEAT_TAKEN", "message": "..." } }
```

---

## 5. Anti-patterns (MUST NOT do)
| Anti-pattern | Instead |
|---|---|
| `import { X } from '../other-feature/x.service'` (non-exported) | Inject via that feature's `Module.exports` |
| Circular imports between two feature modules | Extract shared contract into `shared/` or use an event |
| Business rules inside `@Controller()` methods | Controller calls one `service` method, nothing else |
| `this.repo.find(...)` called from a service directly | Go through the feature's `*.repository.ts` |
| `const ttl = 600` scattered in code | Read from `ConfigService` / `.env` |

---

## 6. Git Workflow
- **Branch naming**: `feature/<feature-name>-<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`
  e.g. `feature/booking-seat-lock-ttl`
- **Commit message**: Conventional Commits — `<type>(<feature>): <summary>`
  e.g. `feat(booking): add Redis TTL lock before checkout`
- **PR requirements**: linked issue/task, passing tests + lint, no `synchronize: true`/debug code, self-reviewed diff before requesting review.

---

## 7. Testing
- **Unit tests**: colocated, `*.spec.ts` next to the file under test.
- **E2E tests**: root `test/` folder, `*.e2e-spec.ts` (one per feature's HTTP surface).
- **Structure**: Arrange–Act–Assert; one `describe` per class/method, one `it` per behavior.
```ts
describe('BookingService.createBooking', () => {
  it('throws if seat is already locked', async () => { ... });
});
```
- **Coverage**: ≥80% on `service`/business-logic files; controllers/DTOs excluded from the threshold (covered by e2e instead).

---

## 8. NestJS-Specific Patterns
- **Module encapsulation**: a feature's `Module` only `exports` its public service — repository, entities, and internal providers stay unexported.
- **DI only**: never `new BookingService()` — constructor injection everywhere, enables mocking in tests.
- **Config**: `@nestjs/config` with a typed `ConfigService`; never read `process.env` outside `shared/config`.
- **Repository pattern**: `@InjectRepository(Booking)` is only ever injected inside `booking.repository.ts`; `BookingService` depends on `BookingRepository`, never on `Repository<Booking>` directly.
- **Redis access**: wrapped in a feature-owned service (e.g. `SeatLockService` in `features/booking`), not raw `ioredis` calls in controllers/services.
