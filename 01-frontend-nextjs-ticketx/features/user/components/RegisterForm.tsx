'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/types/api-response.type';
import { ROUTES } from '@/shared/utils/routes';
import { useRegister } from '../hooks/useRegister';
import { GoogleLoginButton } from './GoogleLoginButton';

const registerSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên').max(255),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  phone: z.string().max(20).optional().or(z.literal('')),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(
      { ...values, phone: values.phone || undefined },
      { onSuccess: () => router.push(ROUTES.movies) },
    );
  });

  const errorMessage =
    registerMutation.error instanceof ApiError
      ? registerMutation.error.message
      : registerMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  const inputClass = (hasError?: boolean) =>
    `rounded-lg border bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 ${
      hasError ? 'border-red-400' : 'border-zinc-200'
    }`;

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-zinc-700">
          Họ tên
        </label>
        <input
          id="fullName"
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          {...registerField('fullName')}
          className={inputClass(!!errors.fullName)}
        />
        {errors.fullName && (
          <p className="text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...registerField('email')}
          className={inputClass(!!errors.email)}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-zinc-700">
          Số điện thoại (tuỳ chọn)
        </label>
        <input
          id="phone"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          {...registerField('phone')}
          className={inputClass(!!errors.phone)}
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...registerField('password')}
          className={inputClass(!!errors.password)}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="mt-2 cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {registerMutation.isPending ? 'Đang tạo tài khoản…' : 'Đăng ký'}
      </button>

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200" />
        hoặc
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <GoogleLoginButton onSuccess={() => router.push(ROUTES.movies)} />
    </form>
  );
}
