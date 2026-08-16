import type { Cinema } from '../types/cinema.types';
import { CinemaCard } from './CinemaCard';

interface CinemaListProps {
  cinemas: Cinema[];
}

export function CinemaList({ cinemas }: CinemaListProps) {
  if (cinemas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.5-7-11.5a7 7 0 1 1 14 0C19 14.5 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-zinc-500">Không tìm thấy rạp chiếu nào.</p>
      </div>
    );
  }

  return (
    <div className="grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cinemas.map((cinema) => (
        <CinemaCard key={cinema.id} cinema={cinema} />
      ))}
    </div>
  );
}
