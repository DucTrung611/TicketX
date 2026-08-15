'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createSeats, listRooms, listSeats } from '@/features/cinema';
import type { SeatItemPayload, SeatType } from '@/features/cinema';
import { ApiError } from '@/shared/types/api-response.type';

const inputClass =
  'rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300';
const labelClass = 'text-sm font-medium text-zinc-700 dark:text-zinc-300';

const generatorSchema = z.object({
  startRow: z
    .string()
    .min(1, 'Bắt buộc')
    .max(2)
    .regex(/^[A-Za-z]{1,2}$/, 'Chỉ dùng chữ cái'),
  endRow: z
    .string()
    .min(1, 'Bắt buộc')
    .max(2)
    .regex(/^[A-Za-z]{1,2}$/, 'Chỉ dùng chữ cái'),
  seatsPerRow: z.string().min(1, 'Bắt buộc'),
  seatType: z.enum(['standard', 'vip', 'couple']),
});

type GeneratorFormValues = z.infer<typeof generatorSchema>;

function generateSeats(
  startRow: string,
  endRow: string,
  seatsPerRow: number,
  seatType: SeatType,
): SeatItemPayload[] {
  const start = startRow.toUpperCase().charCodeAt(0);
  const end = endRow.toUpperCase().charCodeAt(0);
  const seats: SeatItemPayload[] = [];
  for (let code = Math.min(start, end); code <= Math.max(start, end); code++) {
    const row = String.fromCharCode(code);
    for (let n = 1; n <= seatsPerRow; n++) {
      seats.push({ seatRow: row, seatNumber: n, seatType });
    }
  }
  return seats;
}

export default function AdminRoomSeatsPage() {
  const params = useParams<{ cinemaId: string; roomId: string }>();
  const cinemaId = params.cinemaId;
  const roomId = params.roomId;
  const queryClient = useQueryClient();

  const { data: rooms } = useQuery({
    queryKey: ['rooms', cinemaId],
    queryFn: () => listRooms(cinemaId),
  });
  const room = rooms?.find((r) => r.id === roomId);

  const { data: seats, isLoading: seatsLoading } = useQuery({
    queryKey: ['seats', roomId],
    queryFn: () => listSeats(roomId),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GeneratorFormValues>({
    resolver: zodResolver(generatorSchema),
    defaultValues: { startRow: 'A', endRow: 'E', seatsPerRow: '10', seatType: 'standard' },
  });

  const createMutation = useMutation({
    mutationFn: (payload: SeatItemPayload[]) => createSeats(roomId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seats', roomId] });
      void queryClient.invalidateQueries({ queryKey: ['rooms', cinemaId] });
    },
  });

  const onSubmit = handleSubmit((values) => {
    const seatsPerRow = Number(values.seatsPerRow);
    const generated = generateSeats(values.startRow, values.endRow, seatsPerRow, values.seatType);
    createMutation.mutate(generated);
  });

  const watched = watch();
  const previewCount =
    watched.startRow && watched.endRow && watched.seatsPerRow
      ? generateSeats(
          watched.startRow,
          watched.endRow,
          Number(watched.seatsPerRow) || 0,
          watched.seatType,
        ).length
      : 0;

  const errorMessage =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại'
        : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Quản lý ghế{room ? ` — ${room.name}` : ''}
      </h1>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
      >
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Tạo ghế hàng loạt
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Từ hàng</label>
            <input className={inputClass} {...register('startRow')} />
            {errors.startRow && <p className="text-sm text-red-600">{errors.startRow.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Đến hàng</label>
            <input className={inputClass} {...register('endRow')} />
            {errors.endRow && <p className="text-sm text-red-600">{errors.endRow.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Số ghế/hàng</label>
            <input type="number" className={inputClass} {...register('seatsPerRow')} />
            {errors.seatsPerRow && (
              <p className="text-sm text-red-600">{errors.seatsPerRow.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Loại ghế</label>
            <select className={inputClass} {...register('seatType')}>
              <option value="standard">Standard</option>
              <option value="vip">VIP</option>
              <option value="couple">Couple</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Sẽ tạo {previewCount} ghế.
        </p>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        {createMutation.isSuccess && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Tạo ghế thành công.
          </p>
        )}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="self-start rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {createMutation.isPending ? 'Đang tạo…' : 'Tạo ghế'}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Ghế hiện có ({seats?.length ?? 0})
        </h2>
        {seatsLoading && <p className="text-sm text-zinc-500">Đang tải…</p>}
        {seats && seats.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {seats
              .slice()
              .sort((a, b) =>
                a.seatRow === b.seatRow
                  ? a.seatNumber - b.seatNumber
                  : a.seatRow.localeCompare(b.seatRow),
              )
              .map((seat) => (
                <span
                  key={seat.id}
                  className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
                >
                  {seat.seatRow}
                  {seat.seatNumber}
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
