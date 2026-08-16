'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/types/api-response.type';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import type { User } from '../types/user.types';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên').max(255),
  phone: z.string().max(20).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const updateProfileMutation = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName,
      phone: user.phone ?? '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateProfileMutation.mutate({
      fullName: values.fullName,
      phone: values.phone || undefined,
    });
  });

  const errorMessage =
    updateProfileMutation.error instanceof ApiError
      ? updateProfileMutation.error.message
      : updateProfileMutation.error
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
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-zinc-900">
          Thông tin cá nhân
        </h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-zinc-700">
          Họ tên
        </label>
        <input
          id="fullName"
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          {...register('fullName')}
          className={`rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 ${errors.fullName ? 'border-red-400' : 'border-zinc-200'}`}
        />
        {errors.fullName && (
          <p className="text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-zinc-700">
          Số điện thoại
        </label>
        <input
          id="phone"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          {...register('phone')}
          className={`rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 ${errors.phone ? 'border-red-400' : 'border-zinc-200'}`}
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      )}
      {updateProfileMutation.isSuccess && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Cập nhật thành công.
        </p>
      )}

      <button
        type="submit"
        disabled={updateProfileMutation.isPending}
        className="mt-2 cursor-pointer self-start rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {updateProfileMutation.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
      </button>
    </form>
  );
}
