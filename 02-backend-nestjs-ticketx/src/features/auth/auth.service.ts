import { randomUUID } from 'crypto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { AppConfig } from '../../config/configuration';
import { MailService } from '../../core/mail/mail.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenService } from './refresh-token.service';
import { OtpService } from './otp.service';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
} from './types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtConfig: AppConfig['jwt'];
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
    configService: ConfigService<AppConfig>,
  ) {
    this.jwtConfig = configService.get('jwt', { infer: true })!;
    this.googleClientId = configService.get('googleAuth', {
      infer: true,
    })!.clientId;
    this.googleClient = new OAuth2Client(this.googleClientId);
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

  async loginWithGoogle(
    idToken: string,
  ): Promise<{ user: UserResponseDto } & TokenPair> {
    const payload = await this.verifyGoogleIdToken(idToken);

    const user = await this.userService.findOrCreateGoogleUser({
      email: payload.email,
      fullName: payload.fullName,
      avatarUrl: payload.avatarUrl,
    });

    if (!user.isActive) {
      throw new UnauthorizedException({
        code: 'AUTH_001',
        message: 'Account is disabled',
      });
    }

    const tokens = this.issueTokenPair(user);
    return { user: this.userService.toResponseDto(user), ...tokens };
  }

  private async verifyGoogleIdToken(
    idToken: string,
  ): Promise<{ email: string; fullName: string; avatarUrl: string | null }> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.email || !payload.email_verified) {
        throw new Error('Email not verified');
      }
      return {
        email: payload.email,
        fullName: payload.name ?? payload.email,
        avatarUrl: payload.picture ?? null,
      };
    } catch {
      throw new UnauthorizedException({
        code: 'AUTH_005',
        message: 'Invalid Google credential',
      });
    }
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

  /**
   * Cooldown is enforced (and always started) regardless of whether the email
   * is registered, and the response is identical either way — otherwise the
   * presence/absence of a 429 across repeated calls would leak which emails
   * have accounts.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    if (await this.otpService.isInCooldown(dto.email)) {
      throw new HttpException(
        {
          code: 'AUTH_007',
          message: 'Too many OTP requests, please try again later',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.otpService.startCooldown(dto.email);

    const user = await this.userService.findByEmail(dto.email);
    if (user) {
      const otp = await this.otpService.issue(dto.email);
      // Swallow delivery failures: the response must stay identical whether
      // or not the email exists, so a flaky SMTP provider can't turn into an
      // account-existence oracle via 200-vs-500 responses.
      try {
        await this.mailService.sendOtpEmail(
          dto.email,
          otp,
          this.otpService.ttlMinutes,
        );
      } catch (error) {
        this.logger.error(`Failed to send OTP email to ${dto.email}`, error);
      }
    }

    return {
      message: 'If an account exists for this email, an OTP has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const isValid = await this.otpService.verify(dto.email, dto.otp);
    const user = isValid ? await this.userService.findByEmail(dto.email) : null;

    if (!isValid || !user) {
      throw new BadRequestException({
        code: 'AUTH_006',
        message: 'Invalid or expired OTP',
      });
    }

    await this.userService.resetPassword(user.id, dto.newPassword);
    return { message: 'Password reset successful' };
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
