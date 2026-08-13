# TicketX – PROJECT-RULES.md (Frontend)

> Companion docs: `API_SPEC.md` (endpoints, response envelope, auth flow) · backend `PROJECT-RULES.md` (naming symmetry)

## Tech Stack
- Framework: Next.js 14+ (App Router)
- State management: Zustand (client/UI state) + TanStack Query (server state / API caching)
- Styling: Tailwind CSS
- HTTP client: Axios, wrapped in a shared `apiClient` (attaches JWT, unwraps `{success,data}`/`{success,error}` from `API_SPEC.md`)

> Assumed, since the original brief only fixed the framework. Swap Zustand→Redux or Axios→fetch if preferred — the folder rules below don't depend on the specific library.

---

## 1. Feature Structure
```
features/booking/
├── components/
│   ├── SeatMap.tsx
│   └── BookingSummary.tsx
├── hooks/
│   ├── useSeatHold.ts
│   └── useCreateBooking.ts
├── services/
│   └── booking.service.ts     # wraps apiClient, one function per API_SPEC.md endpoint
├── stores/
│   └── booking.store.ts        # Zustand slice — selected seats, hold countdown
├── types/
│   └── booking.types.ts
├── utils/
│   └── booking.utils.ts
├── index.ts                    # public barrel — the ONLY import path for other code
└── context.md
```
`app/` holds routing only (`page.tsx`, `layout.tsx`) and imports UI from the matching `features/*` — see §9.

---

## 2. Naming Conventions
| Item | Convention | Example |
|---|---|---|
| Feature folders | kebab-case | `booking`, `showtime` |
| Components | PascalCase file + export | `SeatMap.tsx` → `export function SeatMap()` |
| Hooks | camelCase, `use` prefix | `useSeatHold.ts` |
| Services | kebab-case + `.service.ts`, camelCase verb functions | `booking.service.ts` → `holdSeats()` |
| Stores | kebab-case + `.store.ts`, `useXStore` hook | `booking.store.ts` → `useBookingStore` |
| Types | PascalCase, no `I` prefix | `Booking`, `SeatHoldResponse` |

---

## 3. Feature Rules
- A feature must be usable in isolation — no hidden coupling to another feature's internals.
- **Export only via `index.ts`** — everything else in the folder is private to the feature.
- **No direct imports** between features' internal files.
- Cross-feature communication via:
  - **Global state (minimal)** — e.g. `useAuthStore` in `shared/`, read by any feature
  - **Events** — a small emitter in `shared/events` for decoupled side effects (e.g. booking emits `booking:confirmed`, showtime listens to invalidate its seat query)
  - **URL params** — e.g. showtime passes `showtimeId` via the route; booking reads it with `useParams()`, no import needed
- Shared components location: `shared/components` (design-system pieces: `Button`, `Modal`, `Input`).

```ts
// DO
import { SeatMap } from '@/features/booking';

// DON'T — reaches past the barrel into feature internals
import { SeatMap } from '@/features/booking/components/SeatMap';
```

---

## 4. Component Rules
- One component per file.
- Co-locate: `SeatMap.tsx`, `SeatMap.test.tsx` in the same folder (styling is Tailwind utility classes in-file; CSS Modules only when Tailwind genuinely can't express it).
- Props typing required — explicit `interface SeatMapProps`, never an untyped/`any` prop.
- Max ~150–200 lines per component; beyond that, extract a subcomponent or move logic into a `hooks/` file.

---

## 5. Code Patterns (MUST follow)
- **API calls**: only inside `services/*.service.ts`; hooks/components call the service, never `axios`/`fetch` directly.
- **State**: `useState` first; lift only when 2+ components need it; Zustand only for truly cross-cutting client state (auth, in-progress seat selection).
- **Server state**: TanStack Query owns all API data — never mirror fetched data into a Zustand store (one source of truth).
- **Error handling**: route-level `error.tsx` boundary for render errors; toast notification for `{success:false, error}` responses.
- **Loading states**: skeleton component for first fetch, inline spinner for in-flight mutations (e.g. "Locking seat…").
- **Forms**: React Hook Form + Zod schema, mirroring the backend DTO shape from `API_SPEC.md`.

---

## 6. Anti-patterns (MUST NOT do)
| Anti-pattern | Instead |
|---|---|
| Import path reaching into another feature's `components/`/`services/` | Import from that feature's `index.ts` |
| `fetch(...)` / `axios.get(...)` inside a component body | Call through `xService.method()` |
| Validation/business rules written inline in JSX | Extract to a hook or `utils/` function |
| Props threaded through 3+ layers to reach a leaf | Feature-scoped Zustand store or context |
| `useState<any>(...)` | Explicit interface/type |
| `style={{ color: 'red' }}` | Tailwind utility class (`text-red-500`) |

---

## 7. Git Workflow
- **Branch naming**: `feature/<feature-name>-<short-desc>`, e.g. `feature/booking-seat-map-ui` (mirrors backend convention).
- **Commit message**: Conventional Commits, scoped by feature — `feat(booking): add seat hold countdown timer`.
- **PR scope**: one feature/UI concern per PR; include a screenshot or short clip for visual changes; no drive-by refactors bundled in.

---

## 8. Testing
- **Location**: colocated — `Component.test.tsx` next to `Component.tsx`, `useX.test.ts` next to `useX.ts`.
- **What to test**: user-visible behavior (React Testing Library, query by role/text — not implementation details); hook logic; service-layer envelope unwrapping and error mapping.
- **Coverage focus**: prioritize `hooks/` and `services/` (pure logic); skip snapshot tests on purely presentational components.

---

## 9. Next.js-Specific Patterns
- **`app/` vs `features/`**: `app/` files are routing shells only (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) — they import and render a feature's top-level component, no business logic lives there.
- **Server vs Client Components**: default to Server Components; add `'use client'` only where interactivity/hooks are needed (e.g. `SeatMap` for clicks + WebSocket).
- **Data fetching**: initial page load fetches server-side (Server Component calling the service directly, no client waterfall); subsequent interaction-driven fetches/refetches go through TanStack Query.
- **Store scoping**: one Zustand store per feature that needs client state — never a single app-wide store (keeps the "self-contained feature" rule intact).
- **Real-time**: the Socket.io client connection is owned by `features/booking` (mirrors the gateway in `API_SPEC.md` §8), exposed via a `useSeatSocket` hook — never instantiated ad hoc inside a component.
