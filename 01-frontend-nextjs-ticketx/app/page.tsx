import Link from 'next/link';
import { listMovies, MovieGrid } from '@/features/movie';
import { ROUTES } from '@/shared/utils/routes';

export const revalidate = 60;

export default async function Home() {
  const { data: nowShowing } = await listMovies({ status: 'now_showing', limit: 10 });

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden px-6 py-28 text-center">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <h1 className="relative font-[family-name:var(--font-heading)] text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
          Ticket<span className="text-accent">X</span>
        </h1>
        <p className="relative max-w-md text-lg text-zinc-600">
          Đặt vé xem phim nhanh chóng, chọn ghế và thanh toán chỉ trong vài bước.
        </p>
        <Link
          href={ROUTES.movies}
          className="relative cursor-pointer rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/30 transition-transform hover:-translate-y-0.5"
        >
          Xem phim đang chiếu
        </Link>
      </section>

      <section className="flex flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
            Phim đang chiếu
          </h2>
          <Link href={ROUTES.movies} className="text-sm font-medium text-accent hover:underline">
            Xem tất cả
          </Link>
        </div>
        <MovieGrid movies={nowShowing} />
      </section>
    </div>
  );
}
