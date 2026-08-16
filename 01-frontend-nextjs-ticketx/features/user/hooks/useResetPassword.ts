'use client';

import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../services/user.service';
import type { ResetPasswordPayload } from '../types/user.types';

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  });
}
