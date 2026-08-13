# Frontend: TicketX

## Tech Stack
  - Next.js (App Router) + React 19: file-based routing, Server Components, SSR/ISR for read-heavy pages (movie list, showtimes)
  - TypeScript: type safety, better DX, catch errors early
  - TanStack Query: caches/dedupes calls to the `{success,data}` envelope from `API_SPEC.md`; built-in refetch/invalidation fits the seat-lock TTL model
  - Zustand: a handful of genuinely global states (auth, in-progress seat selection) — no Redux boilerplate needed for a solo project
  - Axios: interceptors handle JWT attach + refresh-on-401, cleaner than raw `fetch` for this
  - Tailwind CSS: fast iteration solo, no separate stylesheets to keep in sync with markup

## Documentation

### Must Read
- @docs/PROJECT-RULES-FRONTEND.md - Conventions, patterns, MUST/MUST NOT
- @docs/ARCHITECTURE-FRONTEND.md - Folder structure, components, state
- @docs/SKILLS-FRONTEND.md - Which `.claude/skills` design skill to use for which kind of FE work

### Reference
- @../00-share-docs/API_SPEC.md - API contract to consume
- @../00-share-docs/DATABASE.md - Data model reference

## Quick Reference

### Feature Location
`src/features/[name]/` - Each feature owns its components, hooks, services, stores, types
`src/app/` - Route files only (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`), no business logic

### Public Exports
Always via `index.ts` file (barrel export)
