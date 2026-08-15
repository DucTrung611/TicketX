'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { refreshAccessToken } from '@/shared/services/api-client';

/**
 * On first mount, if a refresh token survived from a previous session (persisted)
 * but there's no access token yet (never persisted), silently exchange it for a
 * fresh pair so the session survives a page reload.
 *
 * Goes through `refreshAccessToken`'s single-flight guard rather than calling
 * `POST /auth/refresh` directly — React Strict Mode double-invokes effects in
 * development, and without the shared in-flight promise, the second call would
 * present an already-rotated refresh token, get a 401, and clear the session
 * the first call just established.
 */
export function useAuthBootstrap() {
  useEffect(() => {
    const { accessToken, refreshToken, user, clearSession } =
      useAuthStore.getState();

    if (accessToken || !refreshToken || !user) {
      return;
    }

    refreshAccessToken().catch(() => clearSession());
  }, []);
}
