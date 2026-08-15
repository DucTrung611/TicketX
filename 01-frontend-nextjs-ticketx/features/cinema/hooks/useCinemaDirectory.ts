'use client';

import { useQuery } from '@tanstack/react-query';
import { listCinemas, listRooms } from '../services/cinema.service';
import type { Room } from '../types/cinema.types';

export interface RoomDirectoryEntry {
  room: Room;
  cinemaName: string;
  cinemaCity: string;
}

/** Small dataset (dev/demo scope) — flattens cinemas → rooms into one lookup by roomId. */
export function useCinemaDirectory() {
  return useQuery({
    queryKey: ['cinemas', 'directory'],
    queryFn: async () => {
      const cinemas = await listCinemas();
      const roomLists = await Promise.all(
        cinemas.map((cinema) => listRooms(cinema.id)),
      );

      const byRoomId = new Map<string, RoomDirectoryEntry>();
      cinemas.forEach((cinema, index) => {
        for (const room of roomLists[index]) {
          byRoomId.set(room.id, {
            room,
            cinemaName: cinema.name,
            cinemaCity: cinema.city,
          });
        }
      });
      return byRoomId;
    },
    staleTime: 5 * 60_000,
  });
}
