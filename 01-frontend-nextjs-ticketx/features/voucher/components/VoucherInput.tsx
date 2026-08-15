'use client';

import { useState } from 'react';
import { ApiError } from '@/shared/types/api-response.type';
import { useValidateVoucher } from '../hooks/useValidateVoucher';

interface VoucherInputProps {
  orderAmount: number;
  appliedCode: string | null;
  discountAmount: number;
  onApplied: (code: string, discountAmount: number) => void;
  onClear: () => void;
}

export function VoucherInput({
  orderAmount,
  appliedCode,
  discountAmount,
  onApplied,
  onClear,
}: VoucherInputProps) {
  const [code, setCode] = useState('');
  const validateMutation = useValidateVoucher();

  const handleApply = () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    validateMutation.mutate(
      { code: trimmedCode, orderAmount },
      {
        onSuccess: (result) => {
          if (result.valid) {
            onApplied(result.code, result.discountAmount);
          }
        },
      },
    );
  };

  const handleClear = () => {
    setCode('');
    validateMutation.reset();
    onClear();
  };

  const errorMessage =
    validateMutation.error instanceof ApiError
      ? validateMutation.error.message
      : validateMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-zinc-100">Mã giảm giá</h3>

      {appliedCode ? (
        <div className="flex items-center justify-between rounded border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm">
          <div>
            <p className="text-zinc-100">{appliedCode}</p>
            <p className="text-xs text-emerald-400">
              Giảm {discountAmount.toLocaleString('vi-VN')} VND
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-zinc-400 underline hover:text-zinc-200"
          >
            Xóa
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Nhập mã voucher"
            disabled={orderAmount <= 0}
            className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
          />
          <button
            type="button"
            disabled={!code.trim() || orderAmount <= 0 || validateMutation.isPending}
            onClick={handleApply}
            className="shrink-0 rounded border border-amber-400/60 px-3 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {validateMutation.isPending ? 'Đang kiểm tra…' : 'Áp dụng'}
          </button>
        </div>
      )}

      {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
    </div>
  );
}
