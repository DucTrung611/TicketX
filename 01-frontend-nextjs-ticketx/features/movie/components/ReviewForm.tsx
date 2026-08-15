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
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Đánh giá của bạn
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
              className="text-2xl leading-none transition-colors"
              aria-label={`${value} sao`}
            >
              <span
                className={
                  value <= (hoverRating || rating)
                    ? 'text-amber-400'
                    : 'text-zinc-300 dark:text-zinc-700'
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="comment" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nhận xét (tuỳ chọn)
        </label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={createReviewMutation.isPending}
        className="self-start rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {createReviewMutation.isPending ? 'Đang gửi…' : 'Gửi đánh giá'}
      </button>
    </form>
  );
}
