'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createCombo, updateCombo, useCombos } from '@/features/combo';
import type { Combo, CreateComboPayload } from '@/features/combo';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { ApiError } from '@/shared/types/api-response.type';
import {
  adminPageTitleClass,
  btnNeutral,
  btnOutline,
  btnPrimary,
  inputClass,
  labelClass,
} from '@/shared/utils/admin-styles';

const comboSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên combo').max(255),
  description: z.string().optional(),
  price: z.string().min(1, 'Bắt buộc'),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
});

type ComboFormValues = z.infer<typeof comboSchema>;

function toPayload(values: ComboFormValues): CreateComboPayload {
  return {
    name: values.name,
    description: values.description || undefined,
    price: Number(values.price),
    imageUrl: values.imageUrl || undefined,
    isActive: values.isActive,
  };
}

function toDefaults(combo?: Combo): ComboFormValues {
  return {
    name: combo?.name ?? '',
    description: combo?.description ?? '',
    price: combo ? String(combo.price) : '',
    imageUrl: combo?.imageUrl ?? '',
    isActive: combo?.isActive ?? true,
  };
}

function ComboFormFields({
  register,
  errors,
  imageUrl,
}: {
  register: ReturnType<typeof useForm<ComboFormValues>>['register'];
  errors: ReturnType<typeof useForm<ComboFormValues>>['formState']['errors'];
  imageUrl: string | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Tên combo</label>
        <input className={inputClass} {...register('name')} />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Giá</label>
        <input type="number" className={inputClass} {...register('price')} />
        {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className={labelClass}>Mô tả</label>
        <textarea className={inputClass} rows={2} {...register('description')} />
      </div>

      <div className="flex items-end gap-3 sm:col-span-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className={labelClass}>Ảnh (URL)</label>
          <input className={inputClass} {...register('imageUrl')} />
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Xem trước" className="h-full w-full object-cover" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-300">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="1.5" />
              <path d="m21 15-5-5-9 9" />
            </svg>
          )}
        </div>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-3">
        <input type="checkbox" className="peer sr-only" {...register('isActive')} />
        <span className="relative h-6 w-11 shrink-0 rounded-full bg-zinc-300 transition-colors peer-checked:bg-accent">
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
        </span>
        <span className="text-sm text-zinc-700">Đang hoạt động</span>
      </label>
    </div>
  );
}

function CreateComboForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ComboFormValues>({
    resolver: zodResolver(comboSchema),
    defaultValues: toDefaults(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateComboPayload) => createCombo(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['combos'] });
      reset(toDefaults());
    },
  });

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(toPayload(values));
  });

  const errorMessage =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className={adminPageTitleClass}>Thêm combo mới</h2>
      <ComboFormFields register={register} errors={errors} imageUrl={watch('imageUrl')} />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button type="submit" disabled={createMutation.isPending} className={`self-start ${btnPrimary}`}>
        {createMutation.isPending ? 'Đang tạo…' : 'Tạo combo'}
      </button>
    </form>
  );
}

function EditComboForm({ combo, onDone }: { combo: Combo; onDone: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ComboFormValues>({
    resolver: zodResolver(comboSchema),
    defaultValues: toDefaults(combo),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CreateComboPayload) => updateCombo(combo.id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['combos'] });
      onDone();
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateMutation.mutate(toPayload(values));
  });

  const errorMessage =
    updateMutation.error instanceof ApiError
      ? updateMutation.error.message
      : updateMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-accent/30 bg-accent/5 p-5"
    >
      <ComboFormFields register={register} errors={errors} imageUrl={watch('imageUrl')} />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={updateMutation.isPending} className={btnPrimary}>
          {updateMutation.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
        <button type="button" onClick={onDone} className={btnOutline}>
          Huỷ
        </button>
      </div>
    </form>
  );
}

function ComboRow({ combo }: { combo: Combo }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <EditComboForm combo={combo} onDone={() => setIsEditing(false)} />;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          {combo.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={combo.imageUrl} alt={combo.name} className="h-full w-full object-cover" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-300">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="1.5" />
              <path d="m21 15-5-5-9 9" />
            </svg>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-zinc-900">{combo.name}</p>
          <div className="flex items-center gap-1.5">
            <StatusBadge variant={combo.isActive ? 'success' : 'neutral'}>
              {combo.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
            </StatusBadge>
            <span className="text-xs text-zinc-500">{combo.price.toLocaleString('vi-VN')} VND</span>
          </div>
        </div>
      </div>
      <button type="button" onClick={() => setIsEditing(true)} className={btnNeutral}>
        Sửa
      </button>
    </div>
  );
}

export default function AdminCombosPage() {
  const { data: combos, isLoading, isError } = useCombos();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
        Quản lý combo
      </h1>
      <CreateComboForm />
      <div className="flex flex-col gap-3">
        {isLoading && <p className="text-sm text-zinc-500">Đang tải…</p>}
        {isError && <p className="text-sm text-red-600">Không thể tải danh sách combo.</p>}
        {combos?.map((combo) => (
          <ComboRow key={combo.id} combo={combo} />
        ))}
      </div>
    </div>
  );
}
