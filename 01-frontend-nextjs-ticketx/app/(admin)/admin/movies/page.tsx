'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  createMovie,
  deleteMovie,
  listMovies,
  updateMovie,
  uploadMoviePoster,
} from '@/features/movie';
import type { AgeRating, CreateMoviePayload, Movie } from '@/features/movie';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { ApiError } from '@/shared/types/api-response.type';
import { toAssetUrl } from '@/shared/utils/assets';
import {
  adminPageTitleClass,
  btnDestructive,
  btnNeutral,
  btnOutline,
  btnPrimary,
  inputClass,
  labelClass,
  sectionHeaderClass,
} from '@/shared/utils/admin-styles';

const STATUS_VARIANT = {
  now_showing: 'success',
  coming_soon: 'accent',
  ended: 'neutral',
} as const;

const STATUS_LABEL: Record<Movie['status'], string> = {
  now_showing: 'Đang chiếu',
  coming_soon: 'Sắp chiếu',
  ended: 'Đã kết thúc',
};

const movieSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên phim').max(255),
  slug: z.string().max(255).optional(),
  description: z.string().optional(),
  durationMinutes: z.string().optional(),
  releaseDate: z.string().optional(),
  ageRating: z.string().optional(),
  trailerUrl: z.string().optional(),
  status: z.enum(['coming_soon', 'now_showing', 'ended']),
});

type MovieFormValues = z.infer<typeof movieSchema>;

function toPayload(values: MovieFormValues): CreateMoviePayload {
  return {
    title: values.title,
    slug: values.slug || undefined,
    description: values.description || undefined,
    durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : undefined,
    releaseDate: values.releaseDate || undefined,
    ageRating: (values.ageRating || undefined) as AgeRating | undefined,
    trailerUrl: values.trailerUrl || undefined,
    status: values.status,
  };
}

function movieToDefaults(movie?: Movie): MovieFormValues {
  return {
    title: movie?.title ?? '',
    slug: movie?.slug ?? '',
    description: movie?.description ?? '',
    durationMinutes: movie?.durationMinutes ? String(movie.durationMinutes) : '',
    releaseDate: movie?.releaseDate ? movie.releaseDate.slice(0, 10) : '',
    ageRating: movie?.ageRating ?? '',
    trailerUrl: movie?.trailerUrl ?? '',
    status: movie?.status ?? 'coming_soon',
  };
}

function MovieFormFields({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<MovieFormValues>>['register'];
  errors: ReturnType<typeof useForm<MovieFormValues>>['formState']['errors'];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <p className={sectionHeaderClass}>Thông tin cơ bản</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Tên phim</label>
            <input className={inputClass} {...register('title')} />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Slug (tuỳ chọn)</label>
            <input className={inputClass} {...register('slug')} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={labelClass}>Mô tả</label>
            <textarea className={inputClass} rows={2} {...register('description')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Thời lượng (phút)</label>
            <input type="number" className={inputClass} {...register('durationMinutes')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Ngày phát hành</label>
            <input type="date" className={inputClass} {...register('releaseDate')} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={labelClass}>Trailer URL</label>
            <input className={inputClass} {...register('trailerUrl')} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4">
        <p className={sectionHeaderClass}>Phân loại</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Giới hạn độ tuổi</label>
            <select className={inputClass} {...register('ageRating')}>
              <option value="">—</option>
              <option value="P">P</option>
              <option value="C13">C13</option>
              <option value="C16">C16</option>
              <option value="C18">C18</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Trạng thái</label>
            <select className={inputClass} {...register('status')}>
              <option value="coming_soon">Sắp chiếu</option>
              <option value="now_showing">Đang chiếu</option>
              <option value="ended">Đã kết thúc</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateMovieForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: movieToDefaults(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateMoviePayload) => createMovie(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['movies'] });
      reset(movieToDefaults());
    },
  });

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(toPayload(values));
  });

  const errorMessage =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className={adminPageTitleClass}>Thêm phim mới</h2>
      <MovieFormFields register={register} errors={errors} />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button type="submit" disabled={createMutation.isPending} className={`self-start ${btnPrimary}`}>
        {createMutation.isPending ? 'Đang tạo…' : 'Tạo phim'}
      </button>
    </form>
  );
}

function EditMovieForm({ movie, onDone }: { movie: Movie; onDone: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: movieToDefaults(movie),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CreateMoviePayload) => updateMovie(movie.id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['movies'] });
      onDone();
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateMutation.mutate(toPayload(values));
  });

  const errorMessage =
    updateMutation.error instanceof ApiError
      ? updateMutation.error.message
      : updateMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-accent/30 bg-accent/5 p-5"
    >
      <MovieFormFields register={register} errors={errors} />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={updateMutation.isPending} className={btnPrimary}>
          {updateMutation.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
        <button type="button" onClick={onDone} className={btnOutline}>
          Huỷ
        </button>
      </div>
    </form>
  );
}

function MovieRow({ movie }: { movie: Movie }) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteMovie(movie.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMoviePoster(movie.id, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    event.target.value = '';
  };

  const posterUrl = toAssetUrl(movie.posterUrl);

  if (isEditing) {
    return <EditMovieForm movie={movie} onDone={() => setIsEditing(false)} />;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-zinc-100">
          {posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterUrl} alt={movie.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-zinc-900">{movie.title}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge variant={STATUS_VARIANT[movie.status]}>{STATUS_LABEL[movie.status]}</StatusBadge>
            <span className="text-xs text-zinc-500">
              {movie.ageRating ?? '—'} · {movie.durationMinutes ?? '—'} phút
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className={btnOutline}>
          {uploadMutation.isPending ? 'Đang tải…' : 'Tải poster'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        <button type="button" onClick={() => setIsEditing(true)} className={btnNeutral}>
          Sửa
        </button>
        <button
          type="button"
          disabled={deleteMutation.isPending}
          onClick={() => {
            if (window.confirm(`Xoá phim "${movie.title}"?`)) deleteMutation.mutate();
          }}
          className={btnDestructive}
        >
          Xoá
        </button>
      </div>
    </div>
  );
}

export default function AdminMoviesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['movies', { admin: true }],
    queryFn: () => listMovies({ limit: 100 }),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
        Quản lý phim
      </h1>
      <CreateMovieForm />
      <div className="flex flex-col gap-3">
        {isLoading && <p className="text-sm text-zinc-500">Đang tải…</p>}
        {isError && <p className="text-sm text-red-600">Không thể tải danh sách phim.</p>}
        {data?.data.map((movie) => (
          <MovieRow key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
