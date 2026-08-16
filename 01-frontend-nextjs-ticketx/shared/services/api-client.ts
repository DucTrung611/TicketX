import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { ApiError, ApiResponse, ApiSuccessResponse } from '../types/api-response.type';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6060/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

async function doRefreshAccessToken(): Promise<string> {
  const { refreshToken, user } = useAuthStore.getState();
  if (!refreshToken || !user) {
    throw new ApiError('AUTH_003', 'Not authenticated');
  }

  const response = await axios.post<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >(`${API_BASE_URL}/auth/refresh`, { refreshToken });

  const body = response.data;
  if (!body.success) {
    throw new ApiError(body.error.code, body.error.message, body.error.details);
  }

  useAuthStore.getState().setSession({
    user,
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
  });
  return body.data.accessToken;
}

let refreshPromise: Promise<string> | null = null;

/**
 * Single-flight guard around `POST /auth/refresh`: the refresh token rotates
 * on every use, so two concurrent callers (e.g. a React Strict Mode double
 * effect, or a 401-retry racing the bootstrap check) must share one in-flight
 * request — otherwise the loser presents an already-rotated token and gets a
 * 401 that wipes the session the winner just established. The guard lives
 * inside this exported function (not just around one call site) so every
 * caller — the response interceptor below and `useAuthBootstrap` — shares the
 * same in-flight promise.
 */
export function refreshAccessToken(): Promise<string> {
  refreshPromise ??= doRefreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as RetriableConfig | undefined;
    const body = error.response?.data;

    // AUTH_002 (expired access token) is always retriable via refresh.
    // AUTH_003 (missing/malformed access token) is also retried when a refresh
    // token is available: on a hard reload, accessToken starts out null (it is
    // never persisted — see auth.store.ts) while useAuthBootstrap silently
    // refreshes it, so a query that fires before that resolves goes out with
    // no Authorization header and would otherwise fail immediately instead of
    // waiting for the in-flight bootstrap refresh.
    const isRecoverableAuthError =
      error.response?.status === 401 &&
      body &&
      !body.success &&
      (body.error.code === 'AUTH_002' ||
        (body.error.code === 'AUTH_003' &&
          Boolean(useAuthStore.getState().refreshToken)));

    if (isRecoverableAuthError && original && !original._retry) {
      original._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        original.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return apiClient.request(original);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      }
    }

    if (body && !body.success) {
      return Promise.reject(
        new ApiError(body.error.code, body.error.message, body.error.details),
      );
    }

    return Promise.reject(error);
  },
);

export async function unwrap<T>(
  request: Promise<{ data: ApiResponse<T> }>,
): Promise<T> {
  const { data: body } = await request;
  if (!body.success) {
    throw new ApiError(body.error.code, body.error.message, body.error.details);
  }
  return body.data;
}

export async function unwrapWithMeta<T>(
  request: Promise<{ data: ApiResponse<T> }>,
): Promise<{ data: T; meta: ApiSuccessResponse<T>['meta'] }> {
  const { data: body } = await request;
  if (!body.success) {
    throw new ApiError(body.error.code, body.error.message, body.error.details);
  }
  return { data: body.data, meta: body.meta };
}
