'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCinemaDirectory, useCinemas } from '@/features/cinema';
import { useMovies } from '@/features/movie';
import { useShowtimes } from '@/features/showtime';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ShowtimesPage() {
  const [movieId, setMovieId] = useState('');
  const [cinemaId, setCinemaId] = useState('');
  const [date, setDate] = useState('');

  const { data: moviesResult } = useMovies({ limit: 100 });
  const { data: cinemas } = useCinemas();
  const { data: directory } = useCinemaDirectory();
  const { data: showtimes, isLoading } = useShowtimes({
    movieId: movieId || undefined,
    cinemaId: cinemaId || undefined,
    date: date || undefined,
  });

  const movies = useMemo(() => moviesResult?.data ?? [], [moviesResult]);
  const movieTitleById = useMemo(
    () => new Map(movies.map((movie) => [movie.id, movie.title])),
    [movies],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Lịch chiếu
      </h1>

      <div className="flex flex-wrap gap-3">
        <select
          value={movieId}
          onChange={(event) => setMovieId(event.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        >
          <option value="">Tất cả phim</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>

        <select
          value={cinemaId}
          onChange={(event) => setCinemaId(event.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        >
          <option value="">Tất cả rạp</option>
          {(cinemas ?? []).map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải…</p>
      ) : !showtimes || showtimes.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Không có suất chiếu phù hợp.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {showtimes.map((showtime) => {
            const entry = directory?.get(showtime.roomId);
            return (
              <Link
                key={showtime.id}
                href={`/booking/${showtime.id}`}
                className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {movieTitleById.get(showtime.movieId) ?? 'Phim'}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {entry ? `${entry.cinemaName} · ${entry.room.name}` : '—'}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDateTime(showtime.startTime)}
                </span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {showtime.basePrice.toLocaleString('vi-VN')} VND
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
