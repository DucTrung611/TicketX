import { MovieCatalog } from '@/features/movie';

export default function MoviesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
        Phim đang chiếu
      </h1>
      <MovieCatalog />
    </div>
  );
}
