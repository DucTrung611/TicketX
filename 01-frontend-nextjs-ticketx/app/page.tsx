import Link from 'next/link';
import { ROUTES } from '@/shared/utils/routes';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-24 text-center dark:bg-black">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        TicketX
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Đặt vé xem phim nhanh chóng, chọn ghế và thanh toán chỉ trong vài bước.
      </p>
      <Link
        href={ROUTES.movies}
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Xem phim đang chiếu
      </Link>
    </div>
  );
}
