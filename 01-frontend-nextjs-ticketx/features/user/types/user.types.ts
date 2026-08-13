export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export type AuthResponse = { user: User } & AuthTokens;
