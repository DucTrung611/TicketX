'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listRooms } from '../services/cinema.service';
import type { Cinema } from '../types/cinema.types';

const ROOM_TYPE_LABEL: Record<string, string> = {
  standard: 'Thường',
  imax: 'IMAX',
  '4dx': '4DX',
};

interface CinemaCardProps {
  cinema: Cinema;
}

export function CinemaCard({ cinema }: CinemaCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['cinemas', cinema.id, 'rooms'],
    queryFn: () => listRooms(cinema.id),
    enabled: expanded,
  });

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-1.5">
        <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-zinc-900">
          {cinema.name}
        </h3>
        <div className="flex items-start gap-1.5 text-sm text-zinc-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="mt-0.5 shrink-0 text-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.5-7-11.5a7 7 0 1 1 14 0C19 14.5 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>
            {cinema.address} · {cinema.city}
          </span>
        </div>
        {cinema.phone && <p className="pl-[22px] text-xs text-zinc-400">{cinema.phone}</p>}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex cursor-pointer items-center gap-1.5 self-start rounded-full bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {expanded ? 'Ẩn phòng chiếu' : 'Xem phòng chiếu'}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="flex flex-col gap-1.5 border-t border-zinc-100 pt-3">
          {isLoading ? (
            <p className="text-xs text-zinc-500">Đang tải…</p>
          ) : !rooms || rooms.length === 0 ? (
            <p className="text-xs text-zinc-500">Chưa có phòng chiếu.</p>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between text-xs text-zinc-600">
                <span className="font-medium">{room.name}</span>
                <span className="text-zinc-400">
                  {ROOM_TYPE_LABEL[room.roomType] ?? room.roomType} · {room.totalSeats} ghế
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
