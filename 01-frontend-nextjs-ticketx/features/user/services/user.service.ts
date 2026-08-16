import { apiClient, unwrap } from '@/shared/services/api-client';
import type {
  AuthResponse,
  AuthTokens,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from '../types/user.types';

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return unwrap(apiClient.post<{ success: true; data: AuthResponse }>(
    '/auth/register',
    payload,
  ));
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return unwrap(apiClient.post<{ success: true; data: AuthResponse }>(
    '/auth/login',
    payload,
  ));
}

export function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return unwrap(apiClient.post<{ success: true; data: AuthResponse }>(
    '/auth/google',
    { idToken },
  ));
}

export function refresh(refreshToken: string): Promise<AuthTokens> {
  return unwrap(apiClient.post<{ success: true; data: AuthTokens }>(
    '/auth/refresh',
    { refreshToken },
  ));
}

export function logout(refreshToken: string): Promise<{ message: string }> {
  return unwrap(apiClient.post<{ success: true; data: { message: string } }>(
    '/auth/logout',
    { refreshToken },
  ));
}

export function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<{ message: string }> {
  return unwrap(apiClient.post<{ success: true; data: { message: string } }>(
    '/auth/forgot-password',
    payload,
  ));
}

export function resetPassword(
  payload: ResetPasswordPayload,
): Promise<{ message: string }> {
  return unwrap(apiClient.post<{ success: true; data: { message: string } }>(
    '/auth/reset-password',
    payload,
  ));
}

export function getMe(): Promise<User> {
  return unwrap(apiClient.get<{ success: true; data: User }>('/users/me'));
}

export function updateMe(payload: {
  fullName?: string;
  phone?: string;
}): Promise<User> {
  return unwrap(apiClient.patch<{ success: true; data: User }>(
    '/users/me',
    payload,
  ));
}

export function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return unwrap(apiClient.patch<{ success: true; data: { message: string } }>(
    '/users/me/password',
    payload,
  ));
}
