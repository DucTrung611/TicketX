import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getMovieById, ReviewForm, ReviewList } from '@/features/movie';
import { ShowtimePicker } from '@/features/showtime';
import { toAssetUrl } from '@/shared/utils/assets';

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const movie = await getMovieById(id).catch(() => null);
  if (!movie) {
    notFound();
  }

  const posterUrl = toAssetUrl(movie.posterUrl);

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8 md:flex-row">
      <div className="relative aspect-[2/3] w-full max-w-xs shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-sm">
        {posterUrl ? (
          <Image src={posterUrl} alt={movie.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/20 via-zinc-100 to-zinc-200 text-accent">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4.5h16A1.5 1.5 0 0 1 21.5 6v12a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V6A1.5 1.5 0 0 1 4 4.5Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4.5v15M17 4.5v15M2.5 9h4.5M2.5 15h4.5M17 9h4.5M17 15h4.5" />
            </svg>
            <span className="text-sm font-medium text-zinc-500">Chưa có poster</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-zinc-900">
            {movie.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {movie.ageRating && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                {movie.ageRating}
              </span>
            )}
            {movie.durationMinutes && (
              <span className="text-sm text-zinc-500">{movie.durationMinutes} phút</span>
            )}
            {movie.genres.length > 0 && (
              <span className="text-sm text-zinc-500">
                · {movie.genres.map((genre) => genre.name).join(', ')}
              </span>
            )}
          </div>
        </div>

        {movie.description && (
          <p className="text-sm leading-6 text-zinc-700">{movie.description}</p>
        )}

        <div className="border-t border-zinc-200 pt-6">
          <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-bold text-zinc-900">
            Lịch chiếu
          </h2>
          <ShowtimePicker movieId={movie.id} />
        </div>

        <div className="border-t border-zinc-200 pt-6">
          <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-bold text-zinc-900">
            Đánh giá
          </h2>
          <div className="flex flex-col gap-4">
            <ReviewForm movieId={movie.id} />
            <ReviewList movieId={movie.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
