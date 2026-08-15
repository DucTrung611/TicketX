'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { updateMe } from '../services/user.service';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: { fullName?: string; phone?: string }) =>
      updateMe(payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      if (user && accessToken && refreshToken) {
        setSession({
          user: { ...user, fullName: updated.fullName },
          accessToken,
          refreshToken,
        });
      }
    },
  });
}
