# Feature: movie

Owns `movies`, `genres`, `movie_genres` (junction), `reviews` (see `DATABASE.md` §2 "Feature: Movie").

## Responsibilities
- Movie CRUD (admin-only write, public read)
- Genre assignment via `movie_genres` (TypeORM `@ManyToMany` + `@JoinTable`, matches the
  junction table defined in `DATABASE.md`)
- Reviews: list (public) + add (authenticated customer). Stores `reviews.user_id` as a plain
  column — no join into `features/user`'s entity (per `DATABASE.md` §3 cross-feature rule);
  resolve user details via `UserService` if a caller ever needs them
- Poster upload: `ImageUploadInterceptor` (`shared/interceptors`) — local disk storage under
  `uploads/`, served statically at `/uploads/*` (excluded from the global `api` prefix).
  Swap the interceptor's `diskStorage` for an S3/GCS multer-storage-engine when object storage
  is introduced; the controller/service code does not change.

## Error codes
| Code | HTTP | Meaning |
|---|---|---|
| `MOVIE_001` | 404 | Movie not found |
| `MOVIE_002` | 409 | A movie with this slug already exists |
| `MOVIE_003` | 409 | Cannot delete a movie with existing reviews/showtimes (FK `RESTRICT`) |

## Key decisions
- Slug is auto-derived from `title` (or an explicit `slug` field) via a local `slugify()` —
  uniqueness enforced by `uq_movies_slug` at the DB level
- List filtering (`status`, `genreId`) + pagination built on the shared
  `PaginationQueryDto` / `buildPaginationMeta()` (`shared/dto`, `shared/utils`)
