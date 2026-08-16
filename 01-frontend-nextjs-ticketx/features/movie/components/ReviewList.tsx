'use client';

import { useReviews } from '../hooks/useReviews';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating}/5 sao`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span key={value} className={value <= rating ? 'text-accent' : 'text-zinc-300'}>
          {value <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

interface ReviewListProps {
  movieId: string;
}

export function ReviewList({ movieId }: ReviewListProps) {
  const { data: reviews, isLoading } = useReviews(movieId);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Đang tải đánh giá…</p>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-sm text-zinc-500">Chưa có đánh giá nào cho phim này.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <StarRating rating={review.rating} />
            <span className="text-xs text-zinc-400">{formatDate(review.createdAt)}</span>
          </div>
          {review.comment && (
            <p className="border-t border-zinc-100 pt-2 text-sm leading-relaxed text-zinc-700">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
