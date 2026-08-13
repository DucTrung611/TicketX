'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/types/api-response.type';
import { ROUTES } from '@/shared/utils/routes';
import { useRegister } from '../hooks/useRegister';

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

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Họ tên
        </label>
        <input
          id="fullName"
          autoComplete="name"
          {...registerField('fullName')}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
        {errors.fullName && (
          <p className="text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...registerField('email')}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Số điện thoại (tuỳ chọn)
        </label>
        <input
          id="phone"
          autoComplete="tel"
          {...registerField('phone')}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...registerField('password')}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="mt-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {registerMutation.isPending ? 'Đang tạo tài khoản…' : 'Đăng ký'}
      </button>
    </form>
  );
}
