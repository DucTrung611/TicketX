'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCinemaDirectory } from '@/features/cinema';
import { useMovies } from '@/features/movie';
import {
  createShowtime,
  deleteShowtime,
  listShowtimes,
  updateShowtime,
} from '@/features/showtime';
import type { CreateShowtimePayload, Showtime } from '@/features/showtime';
import { ApiError } from '@/shared/types/api-response.type';

const inputClass =
  'rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300';
const labelClass = 'text-sm font-medium text-zinc-700 dark:text-zinc-300';

const showtimeSchema = z.object({
  movieId: z.string().uuid('Vui lòng chọn phim'),
  roomId: z.string().uuid('Vui lòng chọn phòng chiếu'),
  startTime: z.string().min(1, 'Bắt buộc'),
  endTime: z.string().min(1, 'Bắt buộc'),
  basePrice: z.string().min(1, 'Bắt buộc'),
});

type ShowtimeFormValues = z.infer<typeof showtimeSchema>;

function toPayload(values: ShowtimeFormValues): CreateShowtimePayload {
  return {
    movieId: values.movieId,
    roomId: values.roomId,
    startTime: new Date(values.startTime).toISOString(),
    endTime: new Date(values.endTime).toISOString(),
    basePrice: Number(values.basePrice),
  };
}

function toDefaults(showtime?: Showtime): ShowtimeFormValues {
  return {
    movieId: showtime?.movieId ?? '',
    roomId: showtime?.roomId ?? '',
    startTime: showtime ? showtime.startTime.slice(0, 16) : '',
    endTime: showtime ? showtime.endTime.slice(0, 16) : '',
    basePrice: showtime ? String(showtime.basePrice) : '',
  };
}

function ShowtimeFormFields({
  register,
  errors,
  movies,
  rooms,
}: {
  register: ReturnType<typeof useForm<ShowtimeFormValues>>['register'];
  errors: ReturnType<typeof useForm<ShowtimeFormValues>>['formState']['errors'];
  movies: { id: string; title: string }[];
  rooms: { id: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Phim</label>
        <select className={inputClass} {...register('movieId')}>
          <option value="">— chọn phim —</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>
        {errors.movieId && <p className="text-sm text-red-600">{errors.movieId.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Phòng chiếu</label>
        <select className={inputClass} {...register('roomId')}>
          <option value="">— chọn phòng —</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.label}
            </option>
          ))}
        </select>
        {errors.roomId && <p className="text-sm text-red-600">{errors.roomId.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Bắt đầu</label>
        <input type="datetime-local" className={inputClass} {...register('startTime')} />
        {errors.startTime && <p className="text-sm text-red-600">{errors.startTime.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Kết thúc</label>
        <input type="datetime-local" className={inputClass} {...register('endTime')} />
        {errors.endTime && <p className="text-sm text-red-600">{errors.endTime.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Giá vé cơ bản</label>
        <input type="number" className={inputClass} {...register('basePrice')} />
        {errors.basePrice && <p className="text-sm text-red-600">{errors.basePrice.message}</p>}
      </div>
    </div>
  );
}

function CreateShowtimeForm({
  movies,
  rooms,
}: {
  movies: { id: string; title: string }[];
  rooms: { id: string; label: string }[];
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShowtimeFormValues>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: toDefaults(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateShowtimePayload) => createShowtime(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['showtimes'] });
      reset(toDefaults());
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
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Thêm suất chiếu</h2>
      <ShowtimeFormFields register={register} errors={errors} movies={movies} rooms={rooms} />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={createMutation.isPending}
        className="self-start rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {createMutation.isPending ? 'Đang tạo…' : 'Tạo suất chiếu'}
      </button>
    </form>
  );
}

function EditShowtimeForm({
  showtime,
  movies,
  rooms,
  onDone,
}: {
  showtime: Showtime;
  movies: { id: string; title: string }[];
  rooms: { id: string; label: string }[];
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShowtimeFormValues>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: toDefaults(showtime),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CreateShowtimePayload) => updateShowtime(showtime.id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['showtimes'] });
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
      className="flex flex-col gap-3 rounded-lg border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <ShowtimeFormFields register={register} errors={errors} movies={movies} rooms={rooms} />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {updateMutation.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Huỷ
        </button>
      </div>
    </form>
  );
}

function ShowtimeRow({
  showtime,
  movieTitle,
  roomLabel,
  movies,
  rooms,
}: {
  showtime: Showtime;
  movieTitle: string;
  roomLabel: string;
  movies: { id: string; title: string }[];
  rooms: { id: string; label: string }[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteShowtime(showtime.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['showtimes'] });
    },
  });

  if (isEditing) {
    return (
      <EditShowtimeForm
        showtime={showtime}
        movies={movies}
        rooms={rooms}
        onDone={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {movieTitle} · {roomLabel}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {new Date(showtime.startTime).toLocaleString('vi-VN')} –{' '}
          {new Date(showtime.endTime).toLocaleString('vi-VN')} ·{' '}
          {showtime.basePrice.toLocaleString('vi-VN')} VND · {showtime.status}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Sửa
        </button>
        <button
          type="button"
          disabled={deleteMutation.isPending}
          onClick={() => {
            if (window.confirm('Huỷ suất chiếu này?')) deleteMutation.mutate();
          }}
          className="rounded-full border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          Xoá
        </button>
      </div>
    </div>
  );
}

export default function AdminShowtimesPage() {
  const { data: movieData } = useMovies({ limit: 100 });
  const { data: roomDirectory } = useCinemaDirectory();
  const { data: showtimes, isLoading, isError } = useQuery({
    queryKey: ['showtimes', { admin: true }],
    queryFn: () => listShowtimes({ limit: 100 }),
  });

  const movies = useMemo(() => movieData?.data ?? [], [movieData]);
  const rooms = useMemo(() => {
    if (!roomDirectory) return [];
    return Array.from(roomDirectory.values()).map((entry) => ({
      id: entry.room.id,
      label: `${entry.room.name} — ${entry.cinemaName} (${entry.cinemaCity})`,
    }));
  }, [roomDirectory]);

  const movieTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const movie of movies) map.set(movie.id, movie.title);
    return map;
  }, [movies]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Quản lý suất chiếu
      </h1>
      <CreateShowtimeForm movies={movies} rooms={rooms} />
      <div className="flex flex-col gap-3">
        {isLoading && <p className="text-sm text-zinc-500">Đang tải…</p>}
        {isError && <p className="text-sm text-red-600">Không thể tải danh sách suất chiếu.</p>}
        {showtimes?.map((showtime) => (
          <ShowtimeRow
            key={showtime.id}
            showtime={showtime}
            movieTitle={movieTitleById.get(showtime.movieId) ?? showtime.movieId}
            roomLabel={
              roomDirectory?.get(showtime.roomId)
                ? `${roomDirectory.get(showtime.roomId)!.room.name} — ${roomDirectory.get(showtime.roomId)!.cinemaName}`
                : showtime.roomId
            }
            movies={movies}
            rooms={rooms}
          />
        ))}
      </div>
    </div>
  );
}
