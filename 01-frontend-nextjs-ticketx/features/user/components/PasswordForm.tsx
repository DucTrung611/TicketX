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
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Đổi mật khẩu
      </h2>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="currentPassword"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Mật khẩu hiện tại
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register('currentPassword')}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
        {errors.currentPassword && (
          <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="newPassword"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Mật khẩu mới
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register('newPassword')}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
        {errors.newPassword && (
          <p className="text-sm text-red-600">{errors.newPassword.message}</p>
        )}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      {changePasswordMutation.isSuccess && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Đổi mật khẩu thành công.
        </p>
      )}

      <button
        type="submit"
        disabled={changePasswordMutation.isPending}
        className="mt-2 self-start rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {changePasswordMutation.isPending ? 'Đang lưu…' : 'Đổi mật khẩu'}
      </button>
    </form>
  );
}
