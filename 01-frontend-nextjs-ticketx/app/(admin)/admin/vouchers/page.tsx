'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createVoucher, listVouchers } from '@/features/voucher';
import type { CreateVoucherPayload } from '@/features/voucher';
import { ApiError } from '@/shared/types/api-response.type';

const inputClass =
  'rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300';
const labelClass = 'text-sm font-medium text-zinc-700 dark:text-zinc-300';

const voucherSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã').max(64),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.string().min(1, 'Bắt buộc'),
  maxDiscount: z.string().optional(),
  minOrderAmount: z.string().optional(),
  validFrom: z.string().min(1, 'Bắt buộc'),
  validTo: z.string().min(1, 'Bắt buộc'),
  usageLimit: z.string().optional(),
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

function toPayload(values: VoucherFormValues): CreateVoucherPayload {
  return {
    code: values.code,
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
    maxDiscount: values.maxDiscount ? Number(values.maxDiscount) : undefined,
    minOrderAmount: values.minOrderAmount ? Number(values.minOrderAmount) : undefined,
    validFrom: new Date(values.validFrom).toISOString(),
    validTo: new Date(values.validTo).toISOString(),
    usageLimit: values.usageLimit ? Number(values.usageLimit) : undefined,
  };
}

function CreateVoucherForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: { discountType: 'percent' },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateVoucherPayload) => createVoucher(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      reset({ discountType: 'percent' });
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
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Thêm voucher mới</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Mã voucher</label>
          <input className={inputClass} {...register('code')} />
          {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Loại giảm giá</label>
          <select className={inputClass} {...register('discountType')}>
            <option value="percent">Phần trăm</option>
            <option value="fixed">Số tiền cố định</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Giá trị giảm</label>
          <input type="number" className={inputClass} {...register('discountValue')} />
          {errors.discountValue && (
            <p className="text-sm text-red-600">{errors.discountValue.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Giảm tối đa (tuỳ chọn)</label>
          <input type="number" className={inputClass} {...register('maxDiscount')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Đơn tối thiểu (tuỳ chọn)</label>
          <input type="number" className={inputClass} {...register('minOrderAmount')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Giới hạn lượt dùng (tuỳ chọn)</label>
          <input type="number" className={inputClass} {...register('usageLimit')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Hiệu lực từ</label>
          <input type="datetime-local" className={inputClass} {...register('validFrom')} />
          {errors.validFrom && (
            <p className="text-sm text-red-600">{errors.validFrom.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Hiệu lực đến</label>
          <input type="datetime-local" className={inputClass} {...register('validTo')} />
          {errors.validTo && <p className="text-sm text-red-600">{errors.validTo.message}</p>}
        </div>
      </div>
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={createMutation.isPending}
        className="self-start rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {createMutation.isPending ? 'Đang tạo…' : 'Tạo voucher'}
      </button>
    </form>
  );
}

export default function AdminVouchersPage() {
  const { data: vouchers, isLoading, isError } = useQuery({
    queryKey: ['vouchers', { admin: true }],
    queryFn: () => listVouchers(),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quản lý voucher</h1>
      <CreateVoucherForm />
      <div className="flex flex-col gap-2">
        {isLoading && <p className="text-sm text-zinc-500">Đang tải…</p>}
        {isError && <p className="text-sm text-red-600">Không thể tải danh sách voucher.</p>}
        {vouchers?.map((voucher) => (
          <div
            key={voucher.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {voucher.code}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {voucher.discountType === 'percent'
                  ? `${voucher.discountValue}%`
                  : `${voucher.discountValue.toLocaleString('vi-VN')} VND`}{' '}
                · Đã dùng {voucher.usedCount}
                {voucher.usageLimit ? `/${voucher.usageLimit}` : ''} ·{' '}
                {new Date(voucher.validFrom).toLocaleDateString('vi-VN')} –{' '}
                {new Date(voucher.validTo).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
