import Image from 'next/image';
import Link from 'next/link';
import { StatusBadge, type StatusBadgeVariant } from '@/shared/components/StatusBadge';
import { toAssetUrl } from '@/shared/utils/assets';
import type { Movie } from '../types/movie.types';

const STATUS_LABEL: Record<Movie['status'], string> = {
  coming_soon: 'Sắp chiếu',
  now_showing: 'Đang chiếu',
  ended: 'Đã kết thúc',
};

const STATUS_VARIANT: Record<Movie['status'], StatusBadgeVariant> = {
  coming_soon: 'accent',
  now_showing: 'success',
  ended: 'neutral',
};

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = toAssetUrl(movie.posterUrl);

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-100">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 220px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/20 via-zinc-100 to-zinc-200 text-accent">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4.5h16A1.5 1.5 0 0 1 21.5 6v12a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V6A1.5 1.5 0 0 1 4 4.5Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4.5v15M17 4.5v15M2.5 9h4.5M2.5 15h4.5M17 9h4.5M17 15h4.5" />
            </svg>
            <span className="text-xs font-medium text-zinc-500">Chưa có poster</span>
          </div>
        )}
        <StatusBadge variant={STATUS_VARIANT[movie.status]} className="absolute left-2 top-2">
          {STATUS_LABEL[movie.status]}
        </StatusBadge>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">{movie.title}</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {movie.ageRating && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              {movie.ageRating}
            </span>
          )}
          {movie.durationMinutes && (
            <span className="text-xs text-zinc-500">{movie.durationMinutes} phút</span>
          )}
        </div>
        {movie.genres.length > 0 && (
          <p className="line-clamp-1 text-xs text-zinc-500">
            {movie.genres.map((genre) => genre.name).join(', ')}
          </p>
        )}
      </div>
    </Link>
  );
}
