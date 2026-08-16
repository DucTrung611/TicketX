'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getShowtimeById } from '@/features/showtime';
import { getMovieById } from '@/features/movie';
import { useCinemaDirectory } from '@/features/cinema';
import { useShowtimeSeatMap } from '../hooks/useShowtimeSeatMap';
import { useBookingStore } from '../stores/booking.store';
import { SeatMap } from '../components/SeatMap';
import { BookingSummary } from '../components/BookingSummary';

interface BookingPageProps {
  showtimeId: string;
}

export function BookingPage({ showtimeId }: BookingPageProps) {
  const clearSelection = useBookingStore((state) => state.clearSelection);
  useEffect(() => {
    clearSelection();
  }, [showtimeId, clearSelection]);

  const { data: showtime, isLoading: isShowtimeLoading } = useQuery({
    queryKey: ['showtimes', showtimeId],
    queryFn: () => getShowtimeById(showtimeId),
  });

  const { data: movie } = useQuery({
    queryKey: ['movies', showtime?.movieId],
    queryFn: () => getMovieById(showtime!.movieId),
    enabled: Boolean(showtime),
  });

  const { data: directory } = useCinemaDirectory();
  const { seats, isLoading: isSeatsLoading } = useShowtimeSeatMap(showtimeId);

  if (isShowtimeLoading) {
    return (
      <div className="flex flex-1 flex-col bg-[#0F0F23] px-6 py-8">
        <p className="text-sm text-zinc-500">Đang tải suất chiếu…</p>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="flex flex-1 flex-col bg-[#0F0F23] px-6 py-8">
        <p className="text-sm text-red-400">Không tìm thấy suất chiếu.</p>
      </div>
    );
  }

  const roomEntry = directory?.get(showtime.roomId);
  const startTime = new Date(showtime.startTime);

  return (
    <div className="flex flex-1 flex-col gap-6 bg-[#0F0F23] px-6 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-zinc-50">
          {movie?.title ?? 'Đang tải…'}
        </h1>
        <p className="text-sm text-zinc-400">
          {roomEntry
            ? `${roomEntry.cinemaName} · ${roomEntry.room.name}`
            : ''}{' '}
          ·{' '}
          {startTime.toLocaleString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex-1 rounded-xl border border-zinc-800 bg-black p-6">
          {isSeatsLoading ? (
            <p className="text-center text-sm text-zinc-500">Đang tải sơ đồ ghế…</p>
          ) : (
            <SeatMap seats={seats} />
          )}
        </div>

        <BookingSummary showtimeId={showtimeId} seats={seats} />
      </div>
    </div>
  );
}
