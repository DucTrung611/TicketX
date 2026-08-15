import type { Cinema } from '../types/cinema.types';
import { CinemaCard } from './CinemaCard';

interface CinemaListProps {
  cinemas: Cinema[];
}

export function CinemaList({ cinemas }: CinemaListProps) {
  if (cinemas.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Không tìm thấy rạp chiếu nào.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cinemas.map((cinema) => (
        <CinemaCard key={cinema.id} cinema={cinema} />
      ))}
    </div>
  );
}
