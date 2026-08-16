'use client';

import { PasswordForm, ProfileForm, useCurrentUser } from '@/features/user';

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
        Hồ sơ
      </h1>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Đang tải…</p>
      ) : !user ? (
        <p className="text-sm text-zinc-500">Vui lòng đăng nhập để xem hồ sơ.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <ProfileForm user={user} />
          <PasswordForm />
        </div>
      )}
    </div>
  );
}
