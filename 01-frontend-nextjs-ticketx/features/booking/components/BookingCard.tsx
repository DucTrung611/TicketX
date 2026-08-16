'use client';

import Link from 'next/link';
import { ROUTES } from '@/shared/utils/routes';
import { useCancelBooking } from '../hooks/useCancelBooking';
import type { Booking } from '../types/booking.types';

const STATUS_LABEL: Record<Booking['status'], string> = {
  pending: 'Chờ thanh toán',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',
  expired: 'Đã hết hạn',
};

const STATUS_STYLE: Record<Booking['status'], string> = {
  pending: 'bg-accent/15 text-accent',
  confirmed: 'bg-emerald-400/15 text-emerald-400',
  cancelled: 'bg-zinc-700 text-zinc-400',
  expired: 'bg-zinc-700 text-zinc-400',
};

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const cancelMutation = useCancelBooking();

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm font-medium text-zinc-200">{booking.bookingCode}</p>
          <p className="text-xs text-zinc-500">{booking.seatIds.length} ghế</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[booking.status]}`}
        >
          {STATUS_LABEL[booking.status]}
        </span>
      </div>

      <div className="relative flex items-center justify-between border-t border-dashed border-zinc-700 pt-3 text-sm">
        <div className="absolute -left-4 top-0 h-4 w-4 -translate-y-1/2 rounded-full bg-[#0F0F23]" />
        <div className="absolute -right-4 top-0 h-4 w-4 -translate-y-1/2 rounded-full bg-[#0F0F23]" />
        <span className="text-zinc-500">Tổng tiền</span>
        <span className="font-semibold text-zinc-100">
          {booking.totalAmount.toLocaleString('vi-VN')} VND
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {booking.status === 'pending' && (
          <Link
            href={`/checkout/${booking.id}`}
            className="cursor-pointer rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            Thanh toán
          </Link>
        )}
        {booking.status === 'confirmed' && (
          <Link
            href={ROUTES.ticket(booking.id)}
            className="cursor-pointer rounded-full bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 transition-transform hover:-translate-y-0.5"
          >
            Xem vé
          </Link>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate(booking.id)}
            className="cursor-pointer rounded-full border border-red-900/60 px-3.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-700 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {cancelMutation.isPending ? 'Đang huỷ…' : 'Huỷ vé'}
          </button>
        )}
      </div>
    </div>
  );
}
