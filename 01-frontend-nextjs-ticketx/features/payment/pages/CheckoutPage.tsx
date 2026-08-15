'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getBookingById } from '@/features/booking';
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
    return <p className="px-6 py-8 text-sm text-zinc-500">Đang tải…</p>;
  }

  if (!booking) {
    return (
      <p className="px-6 py-8 text-sm text-red-400">Không tìm thấy booking.</p>
    );
  }

  if (booking.status !== 'pending') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-zinc-300">
          Booking này hiện ở trạng thái <strong>{booking.status}</strong>.
        </p>
        <button
          type="button"
          onClick={() => router.push('/my-bookings')}
          className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900"
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

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-12">
      <div className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 p-6">
        <h1 className="mb-4 text-lg font-semibold text-zinc-50">Thanh toán</h1>
        <div className="flex flex-col gap-2 text-sm text-zinc-300">
          <div className="flex justify-between">
            <span className="text-zinc-500">Mã đặt vé</span>
            <span>{booking.bookingCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Số ghế</span>
            <span>{booking.seatIds.length}</span>
          </div>
          {booking.comboItems.length > 0 && (
            <div className="flex flex-col gap-1 border-t border-zinc-800 pt-2">
              <span className="text-zinc-500">Combo</span>
              {booking.comboItems.map((item) => (
                <div key={item.comboId} className="flex justify-between text-xs">
                  <span>x{item.quantity}</span>
                  <span>{item.price.toLocaleString('vi-VN')} VND</span>
                </div>
              ))}
            </div>
          )}
          {booking.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Giảm giá</span>
              <span>-{booking.discountAmount.toLocaleString('vi-VN')} VND</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-800 pt-2 font-semibold text-zinc-50">
            <span>Tổng tiền</span>
            <span>{booking.totalAmount.toLocaleString('vi-VN')} VND</span>
          </div>
        </div>

        <button
          type="button"
          disabled={
            initiateMutation.isPending ||
            (isPolling && paymentStatus?.status !== 'failed')
          }
          onClick={handlePay}
          className="mt-6 w-full rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
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
