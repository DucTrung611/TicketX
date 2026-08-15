'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { ROUTES } from '@/shared/utils/routes';

const TABS = [
  { href: ROUTES.adminMovies, label: 'Phim' },
  { href: ROUTES.adminCinemas, label: 'Rạp chiếu' },
  { href: ROUTES.adminShowtimes, label: 'Lịch chiếu' },
  { href: ROUTES.adminCombos, label: 'Combo' },
  { href: ROUTES.adminVouchers, label: 'Voucher' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          Vui lòng đăng nhập để sử dụng chức năng này.
        </p>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          Bạn không có quyền truy cập trang quản trị.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8 md:flex-row">
      <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto md:w-48 md:flex-col">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
