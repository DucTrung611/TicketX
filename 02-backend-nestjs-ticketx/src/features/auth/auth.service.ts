import { randomUUID } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AppConfig } from '../../config/configuration';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
} from './types/auth.types';

@Injectable()
export class AuthService {
  private readonly jwtConfig: AppConfig['jwt'];

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    configService: ConfigService<AppConfig>,
  ) {
    this.jwtConfig = configService.get('jwt', { infer: true })!;
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ user: UserResponseDto } & TokenPair> {
    const user = await this.userService.createCustomer(dto);
    const tokens = this.issueTokenPair(user);
    return { user: this.userService.toResponseDto(user), ...tokens };
  }

  async login(dto: LoginDto): Promise<{ user: UserResponseDto } & TokenPair> {
    const user = await this.userService.findByEmail(dto.email);
    const isValid = user
      ? await this.userService.verifyPassword(user, dto.password)
      : false;

    if (!user || !isValid || !user.isActive) {
      throw new UnauthorizedException({
        code: 'AUTH_001',
        message: 'Invalid email or password',
      });
    }

    const tokens = this.issueTokenPair(user);
    return { user: this.userService.toResponseDto(user), ...tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);

    if (await this.refreshTokenService.isBlocked(payload.jti)) {
      throw new UnauthorizedException({
        code: 'AUTH_002',
        message: 'Refresh token has been revoked',
      });
    }

    await this.blocklistToken(payload);

    const user = await this.userService.findByIdOrThrow(payload.sub);
    return this.issueTokenPair(user);
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await this.verifyRefreshToken(refreshToken);
    await this.blocklistToken(payload);
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        { secret: this.jwtConfig.refreshSecret },
      );
    } catch {
      throw new UnauthorizedException({
        code: 'AUTH_002',
        message: 'Invalid or expired refresh token',
      });
    }
  }

  private async blocklistToken(payload: RefreshTokenPayload): Promise<void> {
    const ttlSeconds = (payload.exp ?? 0) - Math.floor(Date.now() / 1000);
    await this.refreshTokenService.blocklist(payload.jti, ttlSeconds);
  }

  private issueTokenPair(user: User): TokenPair {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.jwtConfig.accessSecret,
      expiresIn: this.jwtConfig.accessExpiresIn as JwtSignOptions['expiresIn'],
    });

    const refreshPayload: RefreshTokenPayload = {
      ...accessPayload,
      jti: randomUUID(),
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.jwtConfig.refreshSecret,
      expiresIn: this.jwtConfig.refreshExpiresIn as JwtSignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }
}
