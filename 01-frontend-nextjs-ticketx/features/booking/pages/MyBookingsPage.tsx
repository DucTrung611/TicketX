'use client';

import { useBookings } from '../hooks/useBookings';
import { BookingCard } from '../components/BookingCard';

export function MyBookingsPage() {
  const { data: bookings, isLoading } = useBookings();

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 py-8">
      <h1 className="text-xl font-semibold text-zinc-50">Vé của tôi</h1>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Đang tải…</p>
      ) : !bookings || bookings.length === 0 ? (
        <p className="text-sm text-zinc-500">Bạn chưa có vé nào.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
