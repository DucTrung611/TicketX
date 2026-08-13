import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../../core/cache/redis.module';

const LOCK_PREFIX = 'seat_lock:';

@Injectable()
export class SeatLockService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(showtimeId: string, seatId: string): string {
    return `${LOCK_PREFIX}${showtimeId}:${seatId}`;
  }

  /** Acquires the lock if free, or refreshes it if already owned by `userId`. */
  async acquire(
    showtimeId: string,
    seatId: string,
    userId: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const key = this.key(showtimeId, seatId);
    const acquired = await this.redis.set(key, userId, 'EX', ttlSeconds, 'NX');
    if (acquired === 'OK') return true;

    const owner = await this.redis.get(key);
    if (owner === userId) {
      await this.redis.set(key, userId, 'EX', ttlSeconds);
      return true;
    }
    return false;
  }

  async getOwner(showtimeId: string, seatId: string): Promise<string | null> {
    return this.redis.get(this.key(showtimeId, seatId));
  }

  async isOwnedBy(
    showtimeId: string,
    seatId: string,
    userId: string,
  ): Promise<boolean> {
    const owner = await this.getOwner(showtimeId, seatId);
    return owner === userId;
  }

  async release(showtimeId: string, seatId: string): Promise<void> {
    await this.redis.del(this.key(showtimeId, seatId));
  }

  async releaseMany(showtimeId: string, seatIds: string[]): Promise<void> {
    if (seatIds.length === 0) return;
    const keys = seatIds.map((seatId) => this.key(showtimeId, seatId));
    await this.redis.del(...keys);
  }
}
