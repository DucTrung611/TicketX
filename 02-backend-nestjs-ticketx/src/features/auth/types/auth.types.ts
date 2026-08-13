import { UserRole } from '../../user/types/user.types';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload extends AccessTokenPayload {
  jti: string;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
