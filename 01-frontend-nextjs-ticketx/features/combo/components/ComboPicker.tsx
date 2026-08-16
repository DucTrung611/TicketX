'use client';

import { useCombos } from '../hooks/useCombos';
import type { SelectedCombo } from '../types/combo.types';

const MAX_QUANTITY = 5;

interface ComboPickerProps {
  selectedCombos: SelectedCombo[];
  onQuantityChange: (comboId: string, quantity: number) => void;
}

export function ComboPicker({ selectedCombos, onQuantityChange }: ComboPickerProps) {
  const { data: combos, isLoading, isError } = useCombos();

  const quantityFor = (comboId: string) =>
    selectedCombos.find((item) => item.comboId === comboId)?.quantity ?? 0;

  if (isLoading) {
    return <p className="text-xs text-zinc-500">Đang tải combo…</p>;
  }

  if (isError) {
    return <p className="text-xs text-red-400">Không thể tải danh sách combo.</p>;
  }

  if (!combos || combos.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-zinc-100">
        Combo bắp nước
      </h3>
      <ul className="flex flex-col gap-2">
        {combos.map((combo) => {
          const quantity = quantityFor(combo.id);
          return (
            <li
              key={combo.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 p-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-200">{combo.name}</p>
                <p className="text-xs text-zinc-500">
                  {combo.price.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-zinc-800 p-1">
                <button
                  type="button"
                  disabled={quantity <= 0}
                  onClick={() => onQuantityChange(combo.id, Math.max(0, quantity - 1))}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-base font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold text-zinc-100">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= MAX_QUANTITY}
                  onClick={() =>
                    onQuantityChange(combo.id, Math.min(MAX_QUANTITY, quantity + 1))
                  }
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-base font-medium text-accent transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
