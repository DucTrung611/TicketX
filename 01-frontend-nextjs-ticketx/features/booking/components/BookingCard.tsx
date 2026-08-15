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
  pending: 'bg-amber-400/15 text-amber-400',
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
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm text-zinc-200">{booking.bookingCode}</p>
          <p className="text-xs text-zinc-500">{booking.seatIds.length} ghế</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[booking.status]}`}
        >
          {STATUS_LABEL[booking.status]}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500">Tổng tiền</span>
        <span className="font-semibold text-zinc-100">
          {booking.totalAmount.toLocaleString('vi-VN')} VND
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {booking.status === 'pending' && (
          <Link
            href={`/checkout/${booking.id}`}
            className="rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-amber-300"
          >
            Thanh toán
          </Link>
        )}
        {booking.status === 'confirmed' && (
          <Link
            href={ROUTES.ticket(booking.id)}
            className="rounded-full border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-300"
          >
            Xem vé
          </Link>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate(booking.id)}
            className="rounded-full border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:border-red-700 disabled:opacity-40"
          >
            {cancelMutation.isPending ? 'Đang huỷ…' : 'Huỷ vé'}
          </button>
        )}
      </div>
    </div>
  );
}
