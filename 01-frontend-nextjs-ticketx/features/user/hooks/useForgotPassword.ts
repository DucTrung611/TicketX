'use client';

import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../services/user.service';
import type { ForgotPasswordPayload } from '../types/user.types';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  });
}
