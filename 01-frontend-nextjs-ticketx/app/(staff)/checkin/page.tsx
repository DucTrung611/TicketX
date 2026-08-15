'use client';

import { CheckinForm } from '@/features/booking';
import { useAuthStore } from '@/shared/stores/auth.store';

export default function CheckinPage() {
  const user = useAuthStore((state) => state.user);
  const allowed = user?.role === 'staff' || user?.role === 'admin';

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-zinc-300">Vui lòng đăng nhập để sử dụng chức năng này.</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-zinc-300">
          Bạn không có quyền truy cập trang check-in.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-12">
      <h1 className="text-lg font-semibold text-zinc-50">Check-in vé</h1>
      <CheckinForm />
    </div>
  );
}
