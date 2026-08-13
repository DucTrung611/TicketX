# Backend: TicketX

## Tech Stack
- Language: TypeScript
- Framework: NestJS v11
- ORM: TypeORM
- Database: PostgreSQL
- Cache: Redis (seat locks, caching)

## Documentation

### Must Read
- @docs/PROJECT-RULES.md - Conventions, patterns, MUST/MUST NOT
- @docs/ARCHITECTURE.md - Folder structure, layers, feature anatomy

### Reference
- @../00-share-docs/API_SPEC.md - API contract
- @../00-share-docs/DATABASE.md - Schema

## Quick Reference

### Feature Location
`src/features/[name]/` - Each feature owns its controller, service, repository, entities, DTOs
