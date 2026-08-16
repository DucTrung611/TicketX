'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { loginWithGoogle } from '../services/user.service';

export function useGoogleLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (idToken: string) => loginWithGoogle(idToken),
    onSuccess: (data) => {
      setSession(data);
    },
  });
}
