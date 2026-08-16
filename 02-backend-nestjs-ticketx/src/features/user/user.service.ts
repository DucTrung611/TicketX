import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';

const PASSWORD_SALT_ROUNDS = 10;

export interface CreateCustomerInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface FindOrCreateGoogleUserInput {
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_001',
        message: 'User not found',
      });
    }
    return user;
  }

  async createCustomer(input: CreateCustomerInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException({
        code: 'USER_002',
        message: 'Email already registered',
      });
    }

    const passwordHash = await bcrypt.hash(
      input.password,
      PASSWORD_SALT_ROUNDS,
    );
    return this.userRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone ?? null,
    });
  }

  /**
   * Google verifies the email belongs to the caller, so a match against an
   * existing (password-based) account is treated as the same person logging
   * in via a second method — not a conflict. New accounts get no
   * `passwordHash` (Google-only, per `DATABASE.md` §2 "nullable for
   * OAuth-only users").
   */
  async findOrCreateGoogleUser(
    input: FindOrCreateGoogleUserInput,
  ): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      if (!existing.avatarUrl && input.avatarUrl) {
        return this.userRepository.update(existing.id, {
          avatarUrl: input.avatarUrl,
        });
      }
      return existing;
    }

    return this.userRepository.create({
      email: input.email,
      passwordHash: null,
      fullName: input.fullName,
      avatarUrl: input.avatarUrl,
    });
  }

  async verifyPassword(user: User, plainPassword: string): Promise<boolean> {
    if (!user.passwordHash) return false;
    return bcrypt.compare(plainPassword, user.passwordHash);
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findByIdOrThrow(id);
    return this.userRepository.update(id, dto);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
    await this.userRepository.update(id, { passwordHash });
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findByIdOrThrow(id);
    const isValid = await this.verifyPassword(user, dto.currentPassword);
    if (!isValid) {
      throw new UnauthorizedException({
        code: 'AUTH_001',
        message: 'Current password is incorrect',
      });
    }
    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      PASSWORD_SALT_ROUNDS,
    );
    await this.userRepository.update(id, { passwordHash });
  }

  toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
    };
  }
}
