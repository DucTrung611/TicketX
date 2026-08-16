'use client';

import { CheckinForm } from '@/features/booking';
import { useAuthStore } from '@/shared/stores/auth.store';

export default function CheckinPage() {
  const user = useAuthStore((state) => state.user);
  const allowed = user?.role === 'staff' || user?.role === 'admin';

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#0F0F23] px-6 py-16 text-center">
        <p className="text-zinc-300">Vui lòng đăng nhập để sử dụng chức năng này.</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#0F0F23] px-6 py-16 text-center">
        <p className="text-zinc-300">
          Bạn không có quyền truy cập trang check-in.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden bg-[#0F0F23] px-6 py-12">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7V4h3M4 17v3h3M20 7V4h-3M20 17v3h-3M4 12h16" />
          </svg>
        </span>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-50">
          Check-in vé
        </h1>
        <p className="text-sm text-zinc-500">Quét mã QR hoặc nhập mã vé để xác nhận</p>
      </div>
      <CheckinForm />
    </div>
  );
}
