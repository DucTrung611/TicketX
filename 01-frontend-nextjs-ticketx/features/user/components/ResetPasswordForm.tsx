'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/types/api-response.type';
import { ROUTES } from '@/shared/utils/routes';
import { useResetPassword } from '../hooks/useResetPassword';

const resetPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  otp: z.string().regex(/^\d{6}$/, 'Mã OTP gồm 6 chữ số'),
  newPassword: z.string().min(8, 'Mật khẩu mới tối thiểu 8 ký tự'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') ?? '';
  const resetPasswordMutation = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailFromQuery },
  });

  const onSubmit = handleSubmit((values) => {
    resetPasswordMutation.mutate(values, {
      onSuccess: () => router.push(ROUTES.login),
    });
  });

  const errorMessage =
    resetPasswordMutation.error instanceof ApiError
      ? resetPasswordMutation.error.message
      : resetPasswordMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  const inputClass = (hasError?: boolean) =>
    `rounded-lg border bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 ${
      hasError ? 'border-red-400' : 'border-zinc-200'
    }`;

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <p className="text-sm text-zinc-600">
        Nhập mã OTP đã gửi đến email của bạn và mật khẩu mới.
      </p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email')}
          className={inputClass(!!errors.email)}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="otp" className="text-sm font-medium text-zinc-700">
          Mã OTP
        </label>
        <input
          id="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          aria-invalid={!!errors.otp}
          {...register('otp')}
          className={inputClass(!!errors.otp)}
        />
        {errors.otp && <p className="text-sm text-red-600">{errors.otp.message}</p>}
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
          className={inputClass(!!errors.newPassword)}
        />
        {errors.newPassword && (
          <p className="text-sm text-red-600">{errors.newPassword.message}</p>
        )}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={resetPasswordMutation.isPending}
        className="mt-2 cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {resetPasswordMutation.isPending ? 'Đang đặt lại…' : 'Đặt lại mật khẩu'}
      </button>
    </form>
  );
}
