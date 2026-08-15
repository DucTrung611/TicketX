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
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Thông tin cá nhân
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Họ tên
        </label>
        <input
          id="fullName"
          autoComplete="name"
          {...register('fullName')}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
        {errors.fullName && (
          <p className="text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Số điện thoại
        </label>
        <input
          id="phone"
          autoComplete="tel"
          {...register('phone')}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      {updateProfileMutation.isSuccess && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Cập nhật thành công.
        </p>
      )}

      <button
        type="submit"
        disabled={updateProfileMutation.isPending}
        className="mt-2 self-start rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {updateProfileMutation.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
      </button>
    </form>
  );
}
