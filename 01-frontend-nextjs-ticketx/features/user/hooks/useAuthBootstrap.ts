'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { refresh } from '../services/user.service';

/**
 * On first mount, if a refresh token survived from a previous session (persisted)
 * but there's no access token yet (never persisted), silently exchange it for a
 * fresh pair so the session survives a page reload.
 */
export function useAuthBootstrap() {
  useEffect(() => {
    const { accessToken, refreshToken, user, setSession, clearSession } =
      useAuthStore.getState();

    if (accessToken || !refreshToken || !user) {
      return;
    }

    refresh(refreshToken)
      .then((tokens) => setSession({ user, ...tokens }))
      .catch(() => clearSession());
  }, []);
}
