'use client';

import { useMemo, useState } from 'react';
import { CinemaList, useCinemas } from '@/features/cinema';

export default function CinemasPage() {
  const [city, setCity] = useState('');
  const { data: cinemas, isLoading } = useCinemas();

  const cities = useMemo(
    () => Array.from(new Set((cinemas ?? []).map((cinema) => cinema.city))).sort(),
    [cinemas],
  );

  const filtered = useMemo(
    () => (city ? (cinemas ?? []).filter((cinema) => cinema.city === city) : (cinemas ?? [])),
    [cinemas, city],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Rạp chiếu
        </h1>
        {cities.length > 0 && (
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
          >
            <option value="">Tất cả thành phố</option>
            {cities.map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải…</p>
      ) : (
        <CinemaList cinemas={filtered} />
      )}
    </div>
  );
}
