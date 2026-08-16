'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCinemaDirectory, useCinemas } from '@/features/cinema';
import { useMovies } from '@/features/movie';
import { useShowtimes } from '@/features/showtime';
import type { Showtime } from '@/features/showtime';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

const selectClass =
  'cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20';

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

  const groups = useMemo(() => {
    const map = new Map<string, Showtime[]>();
    for (const showtime of showtimes ?? []) {
      const title = movieTitleById.get(showtime.movieId) ?? 'Phim';
      const bucket = map.get(title) ?? [];
      bucket.push(showtime);
      map.set(title, bucket);
    }
    return map;
  }, [showtimes, movieTitleById]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
        Lịch chiếu
      </h1>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-500">
          Phim
          <select value={movieId} onChange={(event) => setMovieId(event.target.value)} className={selectClass}>
            <option value="">Tất cả phim</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-500">
          Rạp chiếu
          <select value={cinemaId} onChange={(event) => setCinemaId(event.target.value)} className={selectClass}>
            <option value="">Tất cả rạp</option>
            {(cinemas ?? []).map((cinema) => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-500">
          Ngày chiếu
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={selectClass}
          />
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Đang tải…</p>
      ) : !showtimes || showtimes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-300">
            <rect x="3" y="5" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          <p className="text-sm text-zinc-500">Không có suất chiếu phù hợp.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {[...groups.entries()].map(([title, group]) => (
            <div key={title} className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-zinc-900">
                {title}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((showtime) => {
                  const entry = directory?.get(showtime.roomId);
                  return (
                    <Link
                      key={showtime.id}
                      href={`/booking/${showtime.id}`}
                      className="group flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-[family-name:var(--font-heading)] text-xl font-bold text-zinc-900 group-hover:text-accent">
                          {formatTime(showtime.startTime)}
                        </span>
                        <span className="text-xs font-medium text-zinc-400">
                          {formatDate(showtime.startTime)}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {entry ? `${entry.cinemaName} · ${entry.room.name}` : '—'}
                      </span>
                      <span className="w-fit rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                        {showtime.basePrice.toLocaleString('vi-VN')} VND
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
