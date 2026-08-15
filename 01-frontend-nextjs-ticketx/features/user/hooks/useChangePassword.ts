'use client';

import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../services/user.service';

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      changePassword(payload),
  });
}
