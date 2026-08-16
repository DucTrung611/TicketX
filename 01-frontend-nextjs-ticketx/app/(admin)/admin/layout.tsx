'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { ROUTES } from '@/shared/utils/routes';

const TABS = [
  {
    href: ROUTES.adminMovies,
    label: 'Phim',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4.5h16A1.5 1.5 0 0 1 21.5 6v12a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V6A1.5 1.5 0 0 1 4 4.5Zm3 0v15m10-15v15M2.5 9h4.5M2.5 15h4.5M17 9h4.5M17 15h4.5" />
    ),
  },
  {
    href: ROUTES.adminCinemas,
    label: 'Rạp chiếu',
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.5-7-11.5a7 7 0 1 1 14 0C19 14.5 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    href: ROUTES.adminShowtimes,
    label: 'Lịch chiếu',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  {
    href: ROUTES.adminCombos,
    label: 'Combo',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h12l-1.2 11.5a1.5 1.5 0 0 1-1.5 1.5H8.7a1.5 1.5 0 0 1-1.5-1.5L6 8Zm1-3.5L9 2h6l2 2.5M6 8h12" />
    ),
  },
  {
    href: ROUTES.adminVouchers,
    label: 'Voucher',
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 12.5 12.9 20a1.5 1.5 0 0 1-2.1 0l-7-7a1.5 1.5 0 0 1 0-2.1l7.5-7.5a1.5 1.5 0 0 1 1.1-.4l6 .2a1.5 1.5 0 0 1 1.4 1.4l.2 6a1.5 1.5 0 0 1-.5 1.1Z" />
        <circle cx="15" cy="9" r="1.5" />
      </>
    ),
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-zinc-500">Vui lòng đăng nhập để sử dụng chức năng này.</p>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-zinc-500">Bạn không có quyền truy cập trang quản trị.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8 md:flex-row">
      <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto md:w-52 md:flex-col">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0">
                {tab.icon}
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
