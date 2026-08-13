'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { login } from '../services/user.service';
import type { LoginPayload } from '../types/user.types';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      setSession(data);
    },
  });
}
