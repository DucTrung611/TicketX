'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { getMe } from '../services/user.service';

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
    enabled: Boolean(accessToken),
  });
}
