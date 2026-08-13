'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { register } from '../services/user.service';
import type { RegisterPayload } from '../types/user.types';

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (data) => {
      setSession(data);
    },
  });
}
