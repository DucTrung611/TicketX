'use client';

import { useMemo, useState } from 'react';
import { useMovies } from '../hooks/useMovies';
import type { MovieStatus } from '../types/movie.types';
import { MovieGrid } from './MovieGrid';
import { MovieGridSkeleton } from './MovieGridSkeleton';

const STATUS_TABS: { value: MovieStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'now_showing', label: 'Đang chiếu' },
  { value: 'coming_soon', label: 'Sắp chiếu' },
];

type SortOption = 'title' | 'release_date';

export function MovieCatalog() {
  const [status, setStatus] = useState<MovieStatus | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('release_date');

  const { data, isPending, isError } = useMovies({
    status: status === 'all' ? undefined : status,
    limit: 40,
  });

  const movies = useMemo(() => {
    const list = data?.data ?? [];
    const sorted = [...list];
    if (sort === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    } else {
      sorted.sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''));
    }
    return sorted;
  }, [data, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                status === tab.value
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-600">
          Sắp xếp
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="release_date">Mới nhất</option>
            <option value="title">Tên A–Z</option>
          </select>
        </label>
      </div>

      {isPending ? (
        <MovieGridSkeleton />
      ) : isError ? (
        <p className="py-16 text-center text-sm text-red-600">
          Không thể tải danh sách phim. Vui lòng thử lại.
        </p>
      ) : (
        <MovieGrid movies={movies} />
      )}
    </div>
  );
}
