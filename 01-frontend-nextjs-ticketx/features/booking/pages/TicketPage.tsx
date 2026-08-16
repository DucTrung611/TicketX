'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { ApiError } from '@/shared/types/api-response.type';
import { ROUTES } from '@/shared/utils/routes';
import { getShowtimeById, getShowtimeSeats } from '@/features/showtime';
import { getMovieById } from '@/features/movie';
import { useCinemaDirectory } from '@/features/cinema';
import { getTicket, getBookingById } from '../services/booking.service';

interface TicketPageProps {
  bookingId: string;
}

export function TicketPage({ bookingId }: TicketPageProps) {
  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bookings', bookingId, 'ticket'],
    queryFn: () => getTicket(bookingId),
    retry: false,
  });

  const { data: booking } = useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: Boolean(ticket),
  });

  const { data: showtime } = useQuery({
    queryKey: ['showtimes', booking?.showtimeId],
    queryFn: () => getShowtimeById(booking!.showtimeId),
    enabled: Boolean(booking),
  });

  const { data: showtimeSeats } = useQuery({
    queryKey: ['showtimes', booking?.showtimeId, 'seats'],
    queryFn: () => getShowtimeSeats(booking!.showtimeId),
    enabled: Boolean(booking),
  });

  const { data: movie } = useQuery({
    queryKey: ['movies', showtime?.movieId],
    queryFn: () => getMovieById(showtime!.movieId),
    enabled: Boolean(showtime),
  });

  const { data: directory } = useCinemaDirectory();

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col bg-[#0F0F23] px-6 py-8">
        <p className="text-sm text-zinc-500">Đang tải vé…</p>
      </div>
    );
  }

  if (error || !ticket) {
    const message =
      error instanceof ApiError ? error.message : 'Không thể tải vé.';
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#0F0F23] px-6 py-16 text-center">
        <p className="text-zinc-300">{message}</p>
        <Link
          href={ROUTES.myBookings}
          className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
        >
          Về Vé của tôi
        </Link>
      </div>
    );
  }

  const roomEntry = showtime ? directory?.get(showtime.roomId) : undefined;
  const seatLabels = booking
    ? (showtimeSeats ?? [])
        .filter((seat) => booking.seatIds.includes(seat.id))
        .map((seat) => `${seat.seatRow}${seat.seatNumber}`)
    : [];

  return (
    <div className="flex flex-1 flex-col items-center bg-[#0F0F23] px-6 py-12">
      <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-1 bg-gradient-to-br from-accent/20 via-zinc-900 to-zinc-900 p-6">
          <span className="text-xs font-medium uppercase tracking-widest text-accent">
            Vé điện tử
          </span>
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-zinc-50">
            {movie?.title ?? 'Đang tải…'}
          </h1>
          <p className="text-sm text-zinc-400">
            {roomEntry ? `${roomEntry.cinemaName} · ${roomEntry.room.name}` : ''}
            {showtime &&
              ` · ${new Date(showtime.startTime).toLocaleString('vi-VN', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}`}
          </p>
          {seatLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {seatLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent"
                >
                  Ghế {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex flex-col items-center gap-4 border-t border-dashed border-zinc-700 p-6">
          <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#0F0F23]" />
          <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#0F0F23]" />

          <div className="rounded-xl bg-white p-4 shadow-lg">
            <QRCodeSVG value={ticket.qrPayload} size={200} />
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-500">Mã đặt vé</span>
            <span className="font-mono text-lg font-semibold tracking-wide text-zinc-50">
              {ticket.bookingCode}
            </span>
          </div>

          <p className="text-center text-xs text-zinc-500">
            Xuất trình mã QR này tại quầy soát vé để check-in.
          </p>

          <Link
            href={ROUTES.myBookings}
            className="text-xs font-medium text-accent hover:underline"
          >
            ← Về Vé của tôi
          </Link>
        </div>
      </div>
    </div>
  );
}
