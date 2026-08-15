'use client';

import Link from 'next/link';
import { useCinemaDirectory } from '@/features/cinema';
import { useShowtimes } from '../hooks/useShowtimes';
import type { Showtime } from '../types/showtime.types';

interface ShowtimePickerProps {
  movieId: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function groupByDate(showtimes: Showtime[]): Map<string, Showtime[]> {
  const groups = new Map<string, Showtime[]>();
  for (const showtime of showtimes) {
    const key = formatDate(showtime.startTime);
    const bucket = groups.get(key) ?? [];
    bucket.push(showtime);
    groups.set(key, bucket);
  }
  return groups;
}

export function ShowtimePicker({ movieId }: ShowtimePickerProps) {
  const { data: showtimes, isLoading } = useShowtimes({ movieId });
  const { data: directory } = useCinemaDirectory();

  if (isLoading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Đang tải suất chiếu…
      </p>
    );
  }

  const upcoming = (showtimes ?? []).filter(
    (showtime) => showtime.status === 'scheduled' || showtime.status === 'ongoing',
  );

  if (upcoming.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Chưa có suất chiếu nào cho phim này.
      </p>
    );
  }

  const groups = groupByDate(upcoming);

  return (
    <div className="flex flex-col gap-6">
      {[...groups.entries()].map(([date, dateShowtimes]) => (
        <div key={date} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {date}
          </h3>
          <div className="flex flex-wrap gap-3">
            {dateShowtimes.map((showtime) => {
              const entry = directory?.get(showtime.roomId);
              return (
                <Link
                  key={showtime.id}
                  href={`/booking/${showtime.id}`}
                  className="flex flex-col rounded-lg border border-zinc-300 px-4 py-2 text-center transition-colors hover:border-zinc-900 dark:border-zinc-700 dark:hover:border-zinc-100"
                >
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatTime(showtime.startTime)}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {entry ? `${entry.cinemaName} · ${entry.room.name}` : '—'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
