'use client';

import Link from 'next/link';
import { useAuthStore } from '@/shared/stores/auth.store';
import { ROUTES } from '@/shared/utils/routes';
import { useLogout } from '@/features/user';

export function NavBar() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-black">
      <Link href={ROUTES.home} className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        TicketX
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <Link
          href={ROUTES.movies}
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Phim
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-zinc-600 dark:text-zinc-400">
              Xin chào, {user.fullName}
              {user.role !== 'customer' && (
                <span className="ml-1 rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {user.role}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href={ROUTES.login} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Đăng nhập
            </Link>
            <Link
              href={ROUTES.register}
              className="rounded-full bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
