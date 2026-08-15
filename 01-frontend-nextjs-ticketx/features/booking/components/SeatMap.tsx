'use client';

import { useMemo } from 'react';
import { useBookingStore } from '../stores/booking.store';
import type { ShowtimeSeat } from '@/features/showtime';

interface SeatMapProps {
  seats: ShowtimeSeat[];
}

const SEAT_STYLES: Record<string, string> = {
  available:
    'border-zinc-600 text-zinc-300 hover:border-amber-400 hover:text-amber-300',
  selected: 'border-amber-400 bg-amber-400 text-zinc-900 font-semibold',
  locked: 'border-zinc-800 bg-zinc-800/60 text-zinc-600 cursor-not-allowed',
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

      <div className="flex flex-col items-center gap-2">
        {rows.map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-1.5">
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
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-[11px] transition-colors ${SEAT_STYLES[styleKey]}`}
                >
                  {seat.seatNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-zinc-400">
        <LegendItem swatchClass="border-zinc-600" label="Còn trống" />
        <LegendItem swatchClass="border-amber-400 bg-amber-400" label="Đang chọn" />
        <LegendItem swatchClass="border-zinc-800 bg-zinc-800/60" label="Đang giữ" />
        <LegendItem swatchClass="border-red-900 bg-red-950/40" label="Đã đặt" />
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
      <span className={`h-3 w-3 rounded border ${swatchClass}`} />
      {label}
    </span>
  );
}
