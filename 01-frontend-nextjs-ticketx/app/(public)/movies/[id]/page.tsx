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
      <div className="relative aspect-[2/3] w-full max-w-xs shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {posterUrl ? (
          <Image src={posterUrl} alt={movie.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
            Chưa có poster
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {movie.title}
          </h1>
          <div className="mt-1 flex flex-wrap gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            {movie.ageRating && <span>{movie.ageRating}</span>}
            {movie.durationMinutes && <span>· {movie.durationMinutes} phút</span>}
            {movie.genres.length > 0 && (
              <span>· {movie.genres.map((genre) => genre.name).join(', ')}</span>
            )}
          </div>
        </div>

        {movie.description && (
          <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {movie.description}
          </p>
        )}

        <div className="mt-4">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Lịch chiếu
          </h2>
          <ShowtimePicker movieId={movie.id} />
        </div>

        <div className="mt-4">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
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
