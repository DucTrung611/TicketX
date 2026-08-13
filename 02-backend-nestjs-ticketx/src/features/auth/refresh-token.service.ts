import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../../core/cache/redis.module';

const BLOCKLIST_PREFIX = 'refresh_blocklist:';

@Injectable()
export class RefreshTokenService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async blocklist(jti: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0) return;
    await this.redis.set(`${BLOCKLIST_PREFIX}${jti}`, '1', 'EX', ttlSeconds);
  }

  async isBlocked(jti: string): Promise<boolean> {
    const value = await this.redis.exists(`${BLOCKLIST_PREFIX}${jti}`);
    return value === 1;
  }
}
