'use client';

import { useMemo } from 'react';
import { useBookingStore } from '../stores/booking.store';
import type { ShowtimeSeat } from '@/features/showtime';

interface SeatMapProps {
  seats: ShowtimeSeat[];
}

const SEAT_STYLES: Record<string, string> = {
  available:
    'border-emerald-600/60 text-zinc-300 hover:border-accent hover:text-accent hover:-translate-y-0.5',
  selected: 'border-accent bg-accent text-accent-foreground font-semibold scale-105',
  locked: 'border-zinc-800 bg-zinc-800/60 text-zinc-600 cursor-not-allowed animate-pulse',
  booked:
    'border-red-900 bg-red-950/40 text-red-800 cursor-not-allowed opacity-70',
};

function seatLabel(seat: ShowtimeSeat): string {
  return `${seat.seatRow}${seat.seatNumber}`;
}

export function SeatMap({ seats }: SeatMapProps) {
  const selectedSeatIds = useBookingStore((state) => state.selectedSeatIds);
  const toggleSeat = useBookingStore((state) => state.toggleSeat);

  const rows = useMemo(() => {
    const grouped = new Map<string, ShowtimeSeat[]>();
    for (const seat of seats) {
      const bucket = grouped.get(seat.seatRow) ?? [];
      bucket.push(seat);
      grouped.set(seat.seatRow, bucket);
    }
    for (const bucket of grouped.values()) {
      bucket.sort((a, b) => a.seatNumber - b.seatNumber);
    }
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto mb-2 h-1.5 w-3/4 rounded-full bg-zinc-700" />
      <p className="text-center text-xs uppercase tracking-widest text-zinc-500">
        Màn hình
      </p>

      <div className="flex flex-col items-center gap-2.5">
        {rows.map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-4 text-xs text-zinc-500">{row}</span>
            {rowSeats.map((seat) => {
              const isSelected = selectedSeatIds.includes(seat.id);
              const isDisabled = seat.status !== 'available' && !isSelected;
              const styleKey = isSelected ? 'selected' : seat.status;

              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={isDisabled}
                  aria-label={`Ghế ${seatLabel(seat)}, ${seat.seatType}, ${
                    isSelected ? 'đang chọn' : seat.status
                  }`}
                  onClick={() => toggleSeat(seat.id)}
                  className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border text-xs transition-all duration-200 disabled:cursor-not-allowed ${SEAT_STYLES[styleKey]}`}
                >
                  {seat.seatNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-zinc-400">
        <LegendItem swatchClass="bg-emerald-500" label="Còn trống" />
        <LegendItem swatchClass="bg-accent" label="Đang chọn" />
        <LegendItem swatchClass="bg-zinc-600" label="Đang giữ" />
        <LegendItem swatchClass="bg-red-800" label="Đã đặt" />
      </div>
    </div>
  );
}

function LegendItem({
  swatchClass,
  label,
}: {
  swatchClass: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${swatchClass}`} />
      {label}
    </span>
  );
}
