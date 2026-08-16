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

    checkinMutation.mutate(bookingId, {
      onSuccess: () => setInput(''),
    });
  };

  const errorMessage =
    checkinMutation.error instanceof ApiError
      ? checkinMutation.error.message
      : checkinMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  const resultState = checkinMutation.isSuccess ? 'success' : errorMessage ? 'error' : null;

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full max-w-md flex-col gap-5 rounded-2xl border p-8 shadow-2xl shadow-black/40 transition-colors ${
        resultState === 'success'
          ? 'border-emerald-500/50 bg-emerald-950/20'
          : resultState === 'error'
            ? 'border-red-500/50 bg-red-950/20'
            : 'border-zinc-700 bg-zinc-900'
      }`}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="ticket-input" className="text-sm font-medium text-zinc-300">
          Mã vé (Booking ID hoặc nội dung QR)
        </label>
        <input
          id="ticket-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="TICKETX:... hoặc booking id"
          autoFocus
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 font-mono text-base text-zinc-100 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {formError && <p className="text-sm text-red-400">{formError}</p>}
      </div>

      <button
        type="submit"
        disabled={checkinMutation.isPending || input.trim().length === 0}
        className="cursor-pointer rounded-full bg-accent px-5 py-4 text-base font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {checkinMutation.isPending ? 'Đang check-in…' : 'Check-in'}
      </button>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="9" />
            <path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round" />
          </svg>
          {errorMessage}
        </div>
      )}

      {checkinMutation.isSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Check-in thành công: {checkinMutation.data.bookingCode}
        </div>
      )}
    </form>
  );
}
