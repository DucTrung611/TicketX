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
      <div className="flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
          Rạp chiếu
        </h1>
        {cities.length > 0 && (
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
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
        <div className="grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100" />
          ))}
        </div>
      ) : (
        <CinemaList cinemas={filtered} />
      )}
    </div>
  );
}
