import Image from 'next/image';
import { toAssetUrl } from '@/shared/utils/assets';
import type { Movie } from '../types/movie.types';

const STATUS_LABEL: Record<Movie['status'], string> = {
  coming_soon: 'Sắp chiếu',
  now_showing: 'Đang chiếu',
  ended: 'Đã kết thúc',
};

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = toAssetUrl(movie.posterUrl);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative aspect-[2/3] w-full bg-zinc-100 dark:bg-zinc-800">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 220px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
            Chưa có poster
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
          {STATUS_LABEL[movie.status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {movie.title}
        </h3>
        <div className="flex flex-wrap gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          {movie.ageRating && <span>{movie.ageRating}</span>}
          {movie.durationMinutes && (
            <span>· {movie.durationMinutes} phút</span>
          )}
        </div>
        {movie.genres.length > 0 && (
          <p className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
            {movie.genres.map((genre) => genre.name).join(', ')}
          </p>
        )}
      </div>
    </article>
  );
}
