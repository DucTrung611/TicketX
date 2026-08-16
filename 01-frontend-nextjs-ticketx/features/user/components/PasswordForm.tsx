'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/types/api-response.type';
import { useChangePassword } from '../hooks/useChangePassword';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(8, 'Mật khẩu mới tối thiểu 8 ký tự'),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function PasswordForm() {
  const changePasswordMutation = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = handleSubmit((values) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => reset(),
    });
  });

  const errorMessage =
    changePasswordMutation.error instanceof ApiError
      ? changePasswordMutation.error.message
      : changePasswordMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-zinc-900">
          Đổi mật khẩu
        </h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="currentPassword" className="text-sm font-medium text-zinc-700">
          Mật khẩu hiện tại
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.currentPassword}
          {...register('currentPassword')}
          className={`rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 ${errors.currentPassword ? 'border-red-400' : 'border-zinc-200'}`}
        />
        {errors.currentPassword && (
          <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-medium text-zinc-700">
          Mật khẩu mới
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...register('newPassword')}
          className={`rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 ${errors.newPassword ? 'border-red-400' : 'border-zinc-200'}`}
        />
        {errors.newPassword && (
          <p className="text-sm text-red-600">{errors.newPassword.message}</p>
        )}
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      )}
      {changePasswordMutation.isSuccess && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Đổi mật khẩu thành công.
        </p>
      )}

      <button
        type="submit"
        disabled={changePasswordMutation.isPending}
        className="mt-2 cursor-pointer self-start rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {changePasswordMutation.isPending ? 'Đang lưu…' : 'Đổi mật khẩu'}
      </button>
    </form>
  );
}
