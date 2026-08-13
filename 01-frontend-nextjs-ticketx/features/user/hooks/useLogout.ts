'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { logout } from '../services/user.service';

export function useLogout() {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await logout(refreshToken);
      }
    },
    onSettled: () => {
      clearSession();
    },
  });
}
