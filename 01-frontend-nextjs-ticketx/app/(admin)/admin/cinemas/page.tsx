'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  createCinema,
  createRoom,
  listCinemas,
  listRooms,
} from '@/features/cinema';
import type { CreateCinemaPayload, CreateRoomPayload } from '@/features/cinema';
import { ApiError } from '@/shared/types/api-response.type';
import { ROUTES } from '@/shared/utils/routes';
import {
  adminPageTitleClass,
  btnOutline,
  btnPrimary,
  inputClass,
  labelClass,
} from '@/shared/utils/admin-styles';

const cinemaSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên rạp').max(255),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ').max(255),
  city: z.string().min(1, 'Vui lòng nhập thành phố').max(100),
  phone: z.string().max(20).optional(),
});

type CinemaFormValues = z.infer<typeof cinemaSchema>;

function CreateCinemaForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CinemaFormValues>({ resolver: zodResolver(cinemaSchema) });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCinemaPayload) => createCinema(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cinemas'] });
      reset();
    },
  });

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate({ ...values, phone: values.phone || undefined });
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
      <h2 className={adminPageTitleClass}>Thêm rạp mới</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Tên rạp</label>
          <input className={inputClass} {...register('name')} />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Thành phố</label>
          <input className={inputClass} {...register('city')} />
          {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className={labelClass}>Địa chỉ</label>
          <input className={inputClass} {...register('address')} />
          {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Số điện thoại (tuỳ chọn)</label>
          <input className={inputClass} {...register('phone')} />
        </div>
      </div>
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button type="submit" disabled={createMutation.isPending} className={`self-start ${btnPrimary}`}>
        {createMutation.isPending ? 'Đang tạo…' : 'Tạo rạp'}
      </button>
    </form>
  );
}

const roomSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên phòng').max(100),
  roomType: z.enum(['standard', 'imax', '4dx']),
});

type RoomFormValues = z.infer<typeof roomSchema>;

function AddRoomForm({ cinemaId }: { cinemaId: string }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: '', roomType: 'standard' },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateRoomPayload) => createRoom(cinemaId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rooms', cinemaId] });
      reset({ name: '', roomType: 'standard' });
    },
  });

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(values as CreateRoomPayload);
  });

  const errorMessage =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Tên phòng</label>
        <input className={`${inputClass} h-9 py-1`} {...register('name')} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Loại phòng</label>
        <select className={`${inputClass} h-9 py-1`} {...register('roomType')}>
          <option value="standard">Standard</option>
          <option value="imax">IMAX</option>
          <option value="4dx">4DX</option>
        </select>
      </div>
      <button type="submit" disabled={createMutation.isPending} className={btnOutline}>
        {createMutation.isPending ? 'Đang thêm…' : 'Thêm phòng'}
      </button>
      {errors.name && <p className="w-full text-xs text-red-600">{errors.name.message}</p>}
      {errorMessage && <p className="w-full text-xs text-red-600">{errorMessage}</p>}
    </form>
  );
}

function CinemaRooms({ cinemaId }: { cinemaId: string }) {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms', cinemaId],
    queryFn: () => listRooms(cinemaId),
  });

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3">
      {isLoading && <p className="text-xs text-zinc-500">Đang tải phòng…</p>}
      {rooms && rooms.length > 0 && (
        <ul className="flex flex-col gap-1">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              <span>
                {room.name} · {room.roomType} · {room.totalSeats} ghế
              </span>
              <Link
                href={ROUTES.adminCinemaSeats(cinemaId, room.id)}
                className="text-xs font-medium text-accent hover:underline"
              >
                Quản lý ghế
              </Link>
            </li>
          ))}
        </ul>
      )}
      <AddRoomForm cinemaId={cinemaId} />
    </div>
  );
}

function CinemaRow({ cinema }: { cinema: { id: string; name: string; address: string; city: string; phone: string | null } }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{cinema.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0 text-accent">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.5-7-11.5a7 7 0 1 1 14 0C19 14.5 12 21 12 21Z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            {cinema.address}, {cinema.city} {cinema.phone ? `· ${cinema.phone}` : ''}
          </p>
        </div>
        <button type="button" onClick={() => setExpanded((value) => !value)} className={`self-start ${btnOutline}`}>
          {expanded ? 'Ẩn phòng chiếu' : 'Quản lý phòng chiếu'}
        </button>
      </div>
      {expanded && <CinemaRooms cinemaId={cinema.id} />}
    </div>
  );
}

export default function AdminCinemasPage() {
  const { data: cinemas, isLoading, isError } = useQuery({
    queryKey: ['cinemas', { admin: true }],
    queryFn: () => listCinemas({ limit: 100 }),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
        Quản lý rạp chiếu
      </h1>
      <CreateCinemaForm />
      <div className="flex flex-col gap-3">
        {isLoading && <p className="text-sm text-zinc-500">Đang tải…</p>}
        {isError && <p className="text-sm text-red-600">Không thể tải danh sách rạp.</p>}
        {cinemas?.map((cinema) => (
          <CinemaRow key={cinema.id} cinema={cinema} />
        ))}
      </div>
    </div>
  );
}
