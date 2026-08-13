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

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
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

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as RetriableConfig | undefined;
    const body = error.response?.data;

    const isExpiredAccessToken =
      error.response?.status === 401 &&
      body &&
      !body.success &&
      body.error.code === 'AUTH_002';

    if (isExpiredAccessToken && original && !original._retry) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newAccessToken = await refreshPromise;
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
