'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { ROUTES } from '@/shared/utils/routes';
import { useLogout } from '@/features/user';

const DARK_CINEMA_PREFIXES = ['/booking', '/checkout', '/my-bookings', '/tickets', '/checkin'];

const NAV_LINKS = [
  { href: ROUTES.movies, label: 'Phim' },
  { href: ROUTES.cinemas, label: 'Rạp chiếu' },
  { href: ROUTES.showtimes, label: 'Lịch chiếu' },
];

export function NavBar() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const pathname = usePathname() ?? '';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const isDarkCinema = DARK_CINEMA_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:rounded-full after:transition-all ${
      isActive(href)
        ? `after:w-full ${isDarkCinema ? 'text-zinc-50 after:bg-accent' : 'text-zinc-900 after:bg-accent'}`
        : `after:w-0 ${
            isDarkCinema
              ? 'text-zinc-400 hover:text-zinc-50'
              : 'text-zinc-600 hover:text-zinc-900'
          }`
    }`;

  const dropdownItemClass = (destructive = false) =>
    `flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
      destructive
        ? isDarkCinema
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-red-600 hover:bg-red-50'
        : isDarkCinema
          ? 'text-zinc-300 hover:bg-zinc-800'
          : 'text-zinc-700 hover:bg-zinc-50'
    }`;

  const handleNavigate = () => setMobileOpen(false);

  useEffect(() => {
    if (!accountOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || '?';

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        isDarkCinema
          ? 'border-zinc-800 bg-[#0F0F23]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0F0F23]/80'
          : 'border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href={ROUTES.home}
          onClick={handleNavigate}
          className={`font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight ${
            isDarkCinema ? 'text-zinc-50' : 'text-zinc-900'
          }`}
        >
          Ticket<span className="text-accent">X</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}

          {user && (
            <Link href={ROUTES.myBookings} className={linkClass(ROUTES.myBookings)}>
              Vé của tôi
            </Link>
          )}
          {user && (user.role === 'staff' || user.role === 'admin') && (
            <Link href={ROUTES.checkin} className={linkClass(ROUTES.checkin)}>
              Check-in
            </Link>
          )}
          {user && user.role === 'admin' && (
            <Link href={ROUTES.admin} className={linkClass(ROUTES.admin)}>
              Quản trị
            </Link>
          )}

          {/* Account menu — merges login/register (signed out) or profile/logout (signed in) behind one avatar */}
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              aria-label="Tài khoản"
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                user
                  ? 'bg-accent text-accent-foreground'
                  : isDarkCinema
                    ? 'border border-zinc-700 text-zinc-300 hover:border-zinc-500'
                    : 'border border-zinc-300 text-zinc-600 hover:border-zinc-400'
              }`}
            >
              {user ? (
                initial
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {accountOpen && (
              <div
                role="menu"
                className={`absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border shadow-lg ${
                  isDarkCinema ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'
                }`}
              >
                {user ? (
                  <>
                    <div
                      className={`flex flex-col gap-1 px-4 py-3 ${
                        isDarkCinema ? 'border-b border-zinc-800' : 'border-b border-zinc-100'
                      }`}
                    >
                      <span className={`truncate text-sm font-medium ${isDarkCinema ? 'text-zinc-100' : 'text-zinc-900'}`}>
                        {user.fullName}
                      </span>
                      {user.role !== 'customer' && (
                        <span className="w-fit rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                          {user.role}
                        </span>
                      )}
                    </div>
                    <Link href={ROUTES.profile} onClick={() => setAccountOpen(false)} className={dropdownItemClass()}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" strokeLinecap="round" />
                      </svg>
                      Hồ sơ
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        logoutMutation.mutate();
                      }}
                      disabled={logoutMutation.isPending}
                      className={dropdownItemClass(true)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      {logoutMutation.isPending ? 'Đang đăng xuất…' : 'Đăng xuất'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={ROUTES.login} onClick={() => setAccountOpen(false)} className={dropdownItemClass()}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                      </svg>
                      Đăng nhập
                    </Link>
                    <Link
                      href={ROUTES.register}
                      onClick={() => setAccountOpen(false)}
                      className={`${dropdownItemClass()} font-semibold text-accent`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                        <circle cx="9" cy="8" r="4" />
                        <path d="M2 20c0-4 3-6 7-6s7 2 7 6M18 8v6M15 11h6" strokeLinecap="round" />
                      </svg>
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={mobileOpen}
          className={`cursor-pointer p-2 md:hidden ${isDarkCinema ? 'text-zinc-50' : 'text-zinc-900'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          className={`flex flex-col gap-1 border-t px-6 py-4 md:hidden ${
            isDarkCinema ? 'border-zinc-800 bg-[#0F0F23]' : 'border-zinc-200 bg-white'
          }`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleNavigate}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isActive(link.href)
                  ? 'bg-accent text-accent-foreground'
                  : isDarkCinema
                    ? 'text-zinc-300 hover:bg-zinc-800'
                    : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href={ROUTES.myBookings}
                onClick={handleNavigate}
                className={`rounded-md px-3 py-2 text-sm font-medium ${isDarkCinema ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'}`}
              >
                Vé của tôi
              </Link>
              {(user.role === 'staff' || user.role === 'admin') && (
                <Link
                  href={ROUTES.checkin}
                  onClick={handleNavigate}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isDarkCinema ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'}`}
                >
                  Check-in
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  href={ROUTES.admin}
                  onClick={handleNavigate}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isDarkCinema ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'}`}
                >
                  Quản trị
                </Link>
              )}
              <div className="mt-2 flex flex-col gap-1 border-t px-3 pt-3 border-zinc-800/10">
                <div className="mb-1 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    {initial}
                  </span>
                  <span className={`flex flex-col ${isDarkCinema ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    <span className="text-sm font-medium">{user.fullName}</span>
                    {user.role !== 'customer' && (
                      <span className="w-fit rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                        {user.role}
                      </span>
                    )}
                  </span>
                </div>
                <Link
                  href={ROUTES.profile}
                  onClick={handleNavigate}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isDarkCinema ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'}`}
                >
                  Hồ sơ
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleNavigate();
                    logoutMutation.mutate();
                  }}
                  disabled={logoutMutation.isPending}
                  className={`cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium disabled:opacity-50 ${
                    isDarkCinema ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  {logoutMutation.isPending ? 'Đang đăng xuất…' : 'Đăng xuất'}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-1 border-t px-3 pt-3 border-zinc-800/10">
              <Link
                href={ROUTES.login}
                onClick={handleNavigate}
                className={`rounded-md px-3 py-2 text-sm font-medium ${isDarkCinema ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'}`}
              >
                Đăng nhập
              </Link>
              <Link
                href={ROUTES.register}
                onClick={handleNavigate}
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/10"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
