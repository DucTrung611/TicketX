'use client';

import { useState, type FormEvent } from 'react';
import { ApiError } from '@/shared/types/api-response.type';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useCreateReview } from '../hooks/useCreateReview';

interface ReviewFormProps {
  movieId: string;
}

export function ReviewForm({ movieId }: ReviewFormProps) {
  const user = useAuthStore((state) => state.user);
  const createReviewMutation = useCreateReview(movieId);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (rating < 1) {
      setFormError('Vui lòng chọn số sao');
      return;
    }

    createReviewMutation.mutate(
      { rating, comment: comment || undefined },
      {
        onSuccess: () => {
          setRating(0);
          setComment('');
        },
      },
    );
  };

  const errorMessage =
    createReviewMutation.error instanceof ApiError
      ? createReviewMutation.error.message
      : createReviewMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : formError;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">Đánh giá của bạn</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
              className="cursor-pointer text-2xl leading-none transition-transform hover:scale-110"
              aria-label={`${value} sao`}
            >
              <span className={value <= (hoverRating || rating) ? 'text-accent' : 'text-zinc-300'}>
                {value <= (hoverRating || rating) ? '★' : '☆'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="comment" className="text-sm font-medium text-zinc-700">
          Nhận xét (tuỳ chọn)
        </label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={createReviewMutation.isPending}
        className="cursor-pointer self-start rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {createReviewMutation.isPending ? 'Đang gửi…' : 'Gửi đánh giá'}
      </button>
    </form>
  );
}
