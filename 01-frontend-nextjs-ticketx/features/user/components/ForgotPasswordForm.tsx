'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/types/api-response.type';
import { ROUTES } from '@/shared/utils/routes';
import { useForgotPassword } from '../hooks/useForgotPassword';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit((values) => {
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => router.push(ROUTES.resetPassword(values.email)),
    });
  });

  const errorMessage =
    forgotPasswordMutation.error instanceof ApiError
      ? forgotPasswordMutation.error.message
      : forgotPasswordMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  const inputClass = (hasError?: boolean) =>
    `rounded-lg border bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 ${
      hasError ? 'border-red-400' : 'border-zinc-200'
    }`;

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <p className="text-sm text-zinc-600">
        Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
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

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={forgotPasswordMutation.isPending}
        className="mt-2 cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {forgotPasswordMutation.isPending ? 'Đang gửi mã…' : 'Gửi mã OTP'}
      </button>
    </form>
  );
}
