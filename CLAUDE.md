# Project: TicketX

## Overview
A movie ticket booking platform. Admins manage movies, cinemas, rooms/seats, showtimes, combos and vouchers; customers browse movies/showtimes, hold seats (Redis-backed lock), book, pay via a gateway (VNPay/Momo/Stripe), and receive a QR e-ticket; staff check in tickets via QR scan. Seat availability is broadcast live over WebSocket.

## Tech Stack
  - Frontend: Next.js (App Router), React 19, TypeScript, Tailwind CSS
  - Backend: NestJS v11, TypeScript, TypeORM
  - Database: PostgreSQL 15+ · Redis 7+ (seat locks, cache)

## Structure
```
├── 01-frontend-nextjs-ticketx/   → @01-frontend-nextjs-ticketx/CLAUDE.md
├── 02-backend-nestjs-ticketx/    → @02-backend-nestjs-ticketx/CLAUDE.md
└── 00-share-docs/                → Shared documentation
```

## Shared Docs
- @00-share-docs/API_SPEC.md
- @00-share-docs/DATABASE.md
- @WORKFLOW.md - Step-by-step workflow for building a feature end-to-end (FE + BE)

## Important
- Follow existing patterns in codebase
- Feature naming stays consistent across layers: frontend `features/<name>/`, backend `features/<name>/`, and `API_SPEC.md` §6 groupings all use the same name (e.g. `booking`, `showtime`, `payment`)
- The booking flow is safety-critical: seat holds are enforced in Redis (`POST /bookings/hold`) *and* backed by a DB-level unique constraint (`booking_seats`) — never bypass the hold step or write booking logic that skips the lock check
