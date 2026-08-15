'use client';

import { useState, type FormEvent } from 'react';
import { ApiError } from '@/shared/types/api-response.type';
import { useCheckinBooking } from '../hooks/useCheckinBooking';

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Accepts either a raw booking ID (UUID) or the QR payload `TICKETX:<id>:<code>`. */
function extractBookingId(raw: string): string | null {
  const trimmed = raw.trim();
  const match = trimmed.match(UUID_PATTERN);
  return match ? match[0] : null;
}

export function CheckinForm() {
  const [input, setInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const checkinMutation = useCheckinBooking();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    checkinMutation.reset();

    const bookingId = extractBookingId(input);
    if (!bookingId) {
      setFormError(
        'Không nhận dạng được mã vé. Vui lòng nhập Booking ID hoặc nội dung mã QR.',
      );
      return;
    }

    checkinMutation.mutate(bookingId);
  };

  const errorMessage =
    checkinMutation.error instanceof ApiError
      ? checkinMutation.error.message
      : checkinMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-zinc-700 bg-zinc-900 p-6"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ticket-input" className="text-sm font-medium text-zinc-300">
          Mã vé (Booking ID hoặc nội dung QR)
        </label>
        <input
          id="ticket-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="TICKETX:... hoặc booking id"
          autoFocus
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-300"
        />
        {formError && <p className="text-sm text-red-400">{formError}</p>}
      </div>

      <button
        type="submit"
        disabled={checkinMutation.isPending || input.trim().length === 0}
        className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {checkinMutation.isPending ? 'Đang check-in…' : 'Check-in'}
      </button>

      {errorMessage && (
        <p className="text-center text-sm text-red-400">{errorMessage}</p>
      )}

      {checkinMutation.isSuccess && (
        <div className="rounded-md bg-emerald-400/15 px-3 py-2 text-center text-sm text-emerald-400">
          Check-in thành công: {checkinMutation.data.bookingCode}
        </div>
      )}
    </form>
  );
}
