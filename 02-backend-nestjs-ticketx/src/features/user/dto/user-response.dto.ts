import { UserRole } from '../types/user.types';

export class UserResponseDto {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
}
