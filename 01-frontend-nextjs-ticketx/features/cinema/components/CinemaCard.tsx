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
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {cinema.name}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{cinema.address}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{cinema.city}</p>
        {cinema.phone && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{cinema.phone}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="self-start rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:text-zinc-50"
      >
        {expanded ? 'Ẩn phòng chiếu' : 'Xem phòng chiếu'}
      </button>

      {expanded && (
        <div className="mt-1 flex flex-col gap-1">
          {isLoading ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Đang tải…</p>
          ) : !rooms || rooms.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Chưa có phòng chiếu.
            </p>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400"
              >
                <span>{room.name}</span>
                <span>
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
