'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createVoucher, listVouchers } from '@/features/voucher';
import type { CreateVoucherPayload } from '@/features/voucher';
import { ApiError } from '@/shared/types/api-response.type';
import {
  adminPageTitleClass,
  btnPrimary,
  inputClass,
  labelClass,
  sectionHeaderClass,
} from '@/shared/utils/admin-styles';

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
      className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className={adminPageTitleClass}>Thêm voucher mới</h2>

      <div className="flex flex-col gap-3">
        <p className={sectionHeaderClass}>Mã &amp; loại giảm giá</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4">
        <p className={sectionHeaderClass}>Điều kiện áp dụng</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4">
        <p className={sectionHeaderClass}>Hiệu lực</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button type="submit" disabled={createMutation.isPending} className={`self-start ${btnPrimary}`}>
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
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
        Quản lý voucher
      </h1>
      <CreateVoucherForm />
      <div className="flex flex-col gap-3">
        {isLoading && <p className="text-sm text-zinc-500">Đang tải…</p>}
        {isError && <p className="text-sm text-red-600">Không thể tải danh sách voucher.</p>}
        {vouchers?.map((voucher) => (
          <div
            key={voucher.id}
            className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <p className="font-mono text-sm font-semibold text-zinc-900">{voucher.code}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                {voucher.discountType === 'percent'
                  ? `-${voucher.discountValue}%`
                  : `-${voucher.discountValue.toLocaleString('vi-VN')} VND`}
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                Đã dùng {voucher.usedCount}
                {voucher.usageLimit ? `/${voucher.usageLimit}` : ''}
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                {new Date(voucher.validFrom).toLocaleDateString('vi-VN')} –{' '}
                {new Date(voucher.validTo).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
