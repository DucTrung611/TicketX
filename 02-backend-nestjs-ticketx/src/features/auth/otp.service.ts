import { randomInt } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type Redis from 'ioredis';
import { AppConfig } from '../../config/configuration';
import { REDIS_CLIENT } from '../../core/cache/redis.module';

const OTP_PREFIX = 'otp:';
const OTP_ATTEMPTS_PREFIX = 'otp_attempts:';
const OTP_COOLDOWN_PREFIX = 'otp_cooldown:';
const OTP_SALT_ROUNDS = 10;

@Injectable()
export class OtpService {
  private readonly otpConfig: AppConfig['otp'];

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    configService: ConfigService<AppConfig>,
  ) {
    this.otpConfig = configService.get('otp', { infer: true })!;
  }

  get ttlMinutes(): number {
    return Math.round(this.otpConfig.ttlSeconds / 60);
  }

  async isInCooldown(email: string): Promise<boolean> {
    const exists = await this.redis.exists(`${OTP_COOLDOWN_PREFIX}${email}`);
    return exists === 1;
  }

  async startCooldown(email: string): Promise<void> {
    await this.redis.set(
      `${OTP_COOLDOWN_PREFIX}${email}`,
      '1',
      'EX',
      this.otpConfig.cooldownSeconds,
    );
  }

  /** Generates, hashes and stores a fresh OTP for `email`; returns the plaintext code to email. */
  async issue(email: string): Promise<string> {
    const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const hash = await bcrypt.hash(otp, OTP_SALT_ROUNDS);

    await this.redis.set(
      `${OTP_PREFIX}${email}`,
      hash,
      'EX',
      this.otpConfig.ttlSeconds,
    );
    await this.redis.del(`${OTP_ATTEMPTS_PREFIX}${email}`);

    return otp;
  }

  /** Verifies `otp` against the stored hash, capping brute-force attempts. One-time use — consumes the code on success or on exceeding the attempt cap. */
  async verify(email: string, otp: string): Promise<boolean> {
    const key = `${OTP_PREFIX}${email}`;
    const hash = await this.redis.get(key);
    if (!hash) return false;

    const attemptsKey = `${OTP_ATTEMPTS_PREFIX}${email}`;
    const attempts = await this.redis.incr(attemptsKey);
    if (attempts === 1) {
      const ttl = await this.redis.ttl(key);
      await this.redis.expire(
        attemptsKey,
        ttl > 0 ? ttl : this.otpConfig.ttlSeconds,
      );
    }
    if (attempts > this.otpConfig.maxAttempts) {
      await this.redis.del(key, attemptsKey);
      return false;
    }

    const isValid = await bcrypt.compare(otp, hash);
    if (isValid) {
      await this.redis.del(key, attemptsKey);
    }
    return isValid;
  }
}
