'use client';

import { useQuery } from '@tanstack/react-query';
import { getShowtimeSeats } from '@/features/showtime';
import type { ShowtimeSeat } from '@/features/showtime';
import { useSeatSocket } from './useSeatSocket';

export function useShowtimeSeatMap(showtimeId: string) {
  const query = useQuery({
    queryKey: ['showtimes', showtimeId, 'seats'],
    queryFn: () => getShowtimeSeats(showtimeId),
    refetchInterval: 30_000,
  });
  const liveStatuses = useSeatSocket(showtimeId);

  const seats: ShowtimeSeat[] = (query.data ?? []).map((seat) => ({
    ...seat,
    status: liveStatuses[seat.id] ?? seat.status,
  }));

  return { ...query, seats };
}
