import type { Movie } from '../types/movie.types';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
}

export function MovieGrid({ movies }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Chưa có phim nào.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
