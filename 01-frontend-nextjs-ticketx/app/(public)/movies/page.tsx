import { listMovies, MovieGrid } from '@/features/movie';

export const revalidate = 60;

export default async function MoviesPage() {
  const { data: movies } = await listMovies({ status: 'now_showing', limit: 40 });

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Phim đang chiếu
      </h1>
      <MovieGrid movies={movies} />
    </div>
  );
}
