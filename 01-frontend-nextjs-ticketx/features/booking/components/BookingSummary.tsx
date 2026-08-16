'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../stores/booking.store';
import { useSeatHold } from '../hooks/useSeatHold';
import { useCreateBooking } from '../hooks/useCreateBooking';
import { ApiError } from '@/shared/types/api-response.type';
import type { ShowtimeSeat } from '@/features/showtime';
import { ComboPicker, useCombos } from '@/features/combo';
import { VoucherInput } from '@/features/voucher';

interface BookingSummaryProps {
  showtimeId: string;
  seats: ShowtimeSeat[];
}

function useCountdown(expiresAt: string | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return 0;
  return Math.max(0, new Date(expiresAt).getTime() - now);
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function BookingSummary({ showtimeId, seats }: BookingSummaryProps) {
  const router = useRouter();
  const selectedSeatIds = useBookingStore((state) => state.selectedSeatIds);
  const holdExpiresAt = useBookingStore((state) => state.holdExpiresAt);
  const selectedCombos = useBookingStore((state) => state.selectedCombos);
  const voucherCode = useBookingStore((state) => state.voucherCode);
  const discountAmount = useBookingStore((state) => state.discountAmount);
  const setComboQuantity = useBookingStore((state) => state.setComboQuantity);
  const applyVoucher = useBookingStore((state) => state.applyVoucher);
  const clearVoucher = useBookingStore((state) => state.clearVoucher);

  const holdMutation = useSeatHold();
  const createMutation = useCreateBooking();
  const { data: combos } = useCombos();

  const selectedSeats = seats.filter((seat) => selectedSeatIds.includes(seat.id));
  const seatsTotal = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
    [selectedSeats],
  );

  const combosTotal = useMemo(() => {
    if (!combos) return 0;
    return selectedCombos.reduce((sum, item) => {
      const combo = combos.find((c) => c.id === item.comboId);
      return combo ? sum + combo.price * item.quantity : sum;
    }, 0);
  }, [combos, selectedCombos]);

  const subtotal = seatsTotal + combosTotal;
  const totalPrice = Math.max(0, subtotal - discountAmount);

  const remainingMs = useCountdown(holdExpiresAt);
  const isHoldActive = Boolean(holdExpiresAt) && remainingMs > 0;

  const errorMessage = (mutationError: unknown) =>
    mutationError instanceof ApiError
      ? mutationError.message
      : mutationError
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  const handleHold = () => {
    holdMutation.mutate({ showtimeId, seatIds: selectedSeatIds });
  };

  const handleCreateBooking = () => {
    const comboItems = selectedCombos.filter((item) => item.quantity > 0);
    createMutation.mutate(
      {
        showtimeId,
        seatIds: selectedSeatIds,
        ...(comboItems.length > 0 ? { comboItems } : {}),
        ...(voucherCode ? { voucherCode } : {}),
      },
      {
        onSuccess: (booking) => router.push(`/checkout/${booking.id}`),
      },
    );
  };

  const isUrgent = isHoldActive && remainingMs < 60_000;

  return (
    <aside className="sticky top-20 flex w-full max-w-xs flex-col gap-4 rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl shadow-black/40">
      <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-zinc-100">
        Ghế đã chọn
      </h3>

      {selectedSeats.length === 0 ? (
        <p className="text-sm text-zinc-500">Chưa chọn ghế nào.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5 text-sm text-zinc-300">
          {selectedSeats.map((seat) => (
            <li
              key={seat.id}
              className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-1 font-medium text-accent"
            >
              {seat.seatRow}
              {seat.seatNumber}
            </li>
          ))}
        </ul>
      )}

      <ComboPicker selectedCombos={selectedCombos} onQuantityChange={setComboQuantity} />

      <VoucherInput
        orderAmount={subtotal}
        appliedCode={voucherCode}
        discountAmount={discountAmount}
        onApplied={applyVoucher}
        onClear={clearVoucher}
      />

      <div className="flex flex-col gap-1 border-t border-zinc-800 pt-3 text-sm">
        <div className="flex items-center justify-between text-zinc-400">
          <span>Tạm tính</span>
          <span>{subtotal.toLocaleString('vi-VN')} VND</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-400">
            <span>Giảm giá</span>
            <span>-{discountAmount.toLocaleString('vi-VN')} VND</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Tổng tiền</span>
          <span className="font-semibold text-zinc-50">
            {totalPrice.toLocaleString('vi-VN')} VND
          </span>
        </div>
      </div>

      {isHoldActive && (
        <p
          className={`text-center text-xs tabular-nums transition-colors ${
            isUrgent ? 'font-bold text-red-400' : 'text-accent'
          }`}
        >
          Giữ ghế còn {formatCountdown(remainingMs)}
        </p>
      )}

      {!isHoldActive ? (
        <button
          type="button"
          disabled={selectedSeats.length === 0 || holdMutation.isPending}
          onClick={handleHold}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {holdMutation.isPending && <Spinner />}
          {holdMutation.isPending ? 'Đang giữ ghế…' : 'Giữ ghế'}
        </button>
      ) : (
        <button
          type="button"
          disabled={createMutation.isPending}
          onClick={handleCreateBooking}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {createMutation.isPending && <Spinner />}
          {createMutation.isPending ? 'Đang xử lý…' : 'Đặt vé'}
        </button>
      )}

      {(errorMessage(holdMutation.error) || errorMessage(createMutation.error)) && (
        <p className="text-center text-xs text-red-400">
          {errorMessage(holdMutation.error) ?? errorMessage(createMutation.error)}
        </p>
      )}
    </aside>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  );
}
