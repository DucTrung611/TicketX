'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/shared/stores/auth.store';
import { getApiOrigin } from '@/shared/utils/assets';
import type { SeatAvailabilityStatus } from '@/features/showtime';

/**
 * Joins the `/showtimes` Socket.io namespace (API_SPEC.md §8) for a given
 * showtime and tracks live seat status overrides pushed by other clients'
 * hold/cancel/payment actions. The initial seat list still comes from
 * `GET /showtimes/:id/seats` (TanStack Query) — this hook only supplies the
 * deltas on top of it.
 */
export function useSeatSocket(showtimeId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [liveStatuses, setLiveStatuses] = useState<
    Record<string, SeatAvailabilityStatus>
  >({});

  useEffect(() => {
    if (!accessToken) return;

    let socket: Socket | null = io(`${getApiOrigin()}/showtimes`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket?.emit('join', { showtimeId });
    });

    socket.on('seat:locked', ({ seatId }: { seatId: string }) => {
      setLiveStatuses((prev) => ({ ...prev, [seatId]: 'locked' }));
    });

    socket.on('seat:released', ({ seatId }: { seatId: string }) => {
      setLiveStatuses((prev) => {
        const next = { ...prev };
        delete next[seatId];
        return next;
      });
    });

    socket.on('seat:booked', ({ seatId }: { seatId: string }) => {
      setLiveStatuses((prev) => ({ ...prev, [seatId]: 'booked' }));
    });

    return () => {
      socket?.emit('leave', { showtimeId });
      socket?.disconnect();
      socket = null;
    };
  }, [accessToken, showtimeId]);

  return liveStatuses;
}
