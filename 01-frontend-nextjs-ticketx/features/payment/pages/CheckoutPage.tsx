'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getBookingById, useCancelBooking } from '@/features/booking';
import { ApiError } from '@/shared/types/api-response.type';
import { useInitiatePayment } from '../hooks/useInitiatePayment';
import { usePaymentStatus } from '../hooks/usePaymentStatus';

interface CheckoutPageProps {
  bookingId: string;
}

export function CheckoutPage({ bookingId }: CheckoutPageProps) {
  const router = useRouter();
  const [isPolling, setIsPolling] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBookingById(bookingId),
  });

  const initiateMutation = useInitiatePayment(bookingId);
  const cancelMutation = useCancelBooking();
  const { data: paymentStatus } = usePaymentStatus(bookingId, isPolling);

  useEffect(() => {
    if (paymentStatus?.status === 'success') {
      router.push('/my-bookings');
    }
  }, [paymentStatus, router]);

  const handlePay = () => {
    initiateMutation.mutate('vnpay', {
      onSuccess: (data) => {
        window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
        setIsPolling(true);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col bg-[#0F0F23] px-6 py-8">
        <p className="text-sm text-zinc-500">Đang tải…</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-1 flex-col bg-[#0F0F23] px-6 py-8">
        <p className="text-sm text-red-400">Không tìm thấy booking.</p>
      </div>
    );
  }

  if (booking.status !== 'pending') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#0F0F23] px-6 py-16 text-center">
        <p className="text-zinc-300">
          Booking này hiện ở trạng thái <strong>{booking.status}</strong>.
        </p>
        <button
          type="button"
          onClick={() => router.push('/my-bookings')}
          className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
        >
          Xem vé của tôi
        </button>
      </div>
    );
  }

  const errorMessage =
    initiateMutation.error instanceof ApiError
      ? initiateMutation.error.message
      : initiateMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  const comboTotal = booking.comboItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = booking.totalAmount + booking.discountAmount;
  const seatsTotal = subtotal - comboTotal;
  const isBusy = initiateMutation.isPending || (isPolling && paymentStatus?.status !== 'failed');

  const handleCancel = () => {
    cancelMutation.mutate(bookingId, {
      onSuccess: () => router.push('/my-bookings'),
    });
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-6 bg-[#0F0F23] px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-heading)] text-lg font-bold text-zinc-50">
            Thanh toán
          </h1>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="cursor-pointer text-xs font-medium text-zinc-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Huỷ đặt vé
          </button>
        </div>
        <div className="flex flex-col gap-2 text-sm text-zinc-300">
          <div className="flex justify-between">
            <span className="text-zinc-500">Mã đặt vé</span>
            <span className="font-medium">{booking.bookingCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Ghế ({booking.seatIds.length})</span>
            <span>{seatsTotal.toLocaleString('vi-VN')} VND</span>
          </div>
          {booking.comboItems.length > 0 && (
            <div className="flex flex-col gap-1 border-t border-zinc-800 pt-2">
              <span className="text-zinc-500">Combo</span>
              {booking.comboItems.map((item) => (
                <div key={item.comboId} className="flex justify-between text-xs">
                  <span>x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString('vi-VN')} VND</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-800 pt-2">
            <span className="text-zinc-500">Tạm tính</span>
            <span>{subtotal.toLocaleString('vi-VN')} VND</span>
          </div>
          {booking.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Giảm giá</span>
              <span>-{booking.discountAmount.toLocaleString('vi-VN')} VND</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-800 pt-2 text-base font-semibold text-zinc-50">
            <span>Tổng tiền</span>
            <span>{booking.totalAmount.toLocaleString('vi-VN')} VND</span>
          </div>
        </div>

        <button
          type="button"
          disabled={isBusy}
          onClick={handlePay}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isBusy && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
            </svg>
          )}
          {!isBusy && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" strokeLinecap="round" />
            </svg>
          )}
          {paymentStatus?.status === 'failed'
            ? 'Thử lại thanh toán'
            : isPolling
              ? 'Đang chờ xác nhận thanh toán…'
              : initiateMutation.isPending
                ? 'Đang khởi tạo…'
                : 'Thanh toán qua VNPay (mock)'}
        </button>

        {isPolling && (
          <p className="mt-3 text-center text-xs text-zinc-500">
            Hoàn tất thanh toán ở tab vừa mở — trang này sẽ tự chuyển khi thành công.
            {paymentStatus?.status === 'failed' && (
              <span className="mt-1 block text-red-400">
                Thanh toán thất bại, bạn có thể thử lại.
              </span>
            )}
          </p>
        )}

        {errorMessage && (
          <p className="mt-3 text-center text-xs text-red-400">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
