'use client';

import { useBookings } from '../hooks/useBookings';
import { BookingCard } from '../components/BookingCard';

export function MyBookingsPage() {
  const { data: bookings, isLoading } = useBookings();

  return (
    <div className="flex flex-1 flex-col gap-6 bg-[#0F0F23] px-6 py-8">
      <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-zinc-50">
        Vé của tôi
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
          ))}
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700">
            <rect x="3" y="6" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 14h4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm text-zinc-500">Bạn chưa có vé nào.</p>
        </div>
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
