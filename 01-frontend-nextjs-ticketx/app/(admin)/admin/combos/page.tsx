'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createCombo, updateCombo, useCombos } from '@/features/combo';
import type { Combo, CreateComboPayload } from '@/features/combo';
import { ApiError } from '@/shared/types/api-response.type';

const inputClass =
  'rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300';
const labelClass = 'text-sm font-medium text-zinc-700 dark:text-zinc-300';

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
}: {
  register: ReturnType<typeof useForm<ComboFormValues>>['register'];
  errors: ReturnType<typeof useForm<ComboFormValues>>['formState']['errors'];
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
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className={labelClass}>Ảnh (URL)</label>
        <input className={inputClass} {...register('imageUrl')} />
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input type="checkbox" {...register('isActive')} />
        Đang hoạt động
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
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Thêm combo mới</h2>
      <ComboFormFields register={register} errors={errors} />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={createMutation.isPending}
        className="self-start rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
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
      className="flex flex-col gap-3 rounded-lg border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <ComboFormFields register={register} errors={errors} />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {updateMutation.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {combo.name} {!combo.isActive && <span className="text-xs text-zinc-400">(ẩn)</span>}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {combo.price.toLocaleString('vi-VN')} VND
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Sửa
      </button>
    </div>
  );
}

export default function AdminCombosPage() {
  const { data: combos, isLoading, isError } = useCombos();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quản lý combo</h1>
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
