'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { ApiError } from '@/shared/types/api-response.type';
import { ROUTES } from '@/shared/utils/routes';
import { getTicket } from '../services/booking.service';

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

  if (isLoading) {
    return <p className="px-6 py-8 text-sm text-zinc-500">Đang tải vé…</p>;
  }

  if (error || !ticket) {
    const message =
      error instanceof ApiError ? error.message : 'Không thể tải vé.';
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-zinc-300">{message}</p>
        <Link
          href={ROUTES.myBookings}
          className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900"
        >
          Về Vé của tôi
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-900 p-6">
        <h1 className="text-lg font-semibold text-zinc-50">Vé điện tử</h1>

        <div className="rounded-lg bg-white p-4">
          <QRCodeSVG value={ticket.qrPayload} size={200} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-zinc-500">Mã đặt vé</span>
          <span className="font-mono text-base font-semibold text-zinc-50">
            {ticket.bookingCode}
          </span>
        </div>

        <p className="w-full break-all rounded bg-black px-3 py-2 text-center font-mono text-xs text-emerald-400">
          {ticket.qrPayload}
        </p>

        <p className="text-center text-xs text-zinc-500">
          Xuất trình mã QR này tại quầy soát vé để check-in.
        </p>

        <Link
          href={ROUTES.myBookings}
          className="text-xs text-zinc-400 hover:text-zinc-200"
        >
          ← Về Vé của tôi
        </Link>
      </div>
    </div>
  );
}
