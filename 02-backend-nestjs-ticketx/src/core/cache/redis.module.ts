import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppConfig } from '../../config/configuration';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const redis = configService.get('redis', { infer: true });
        return new Redis({
          host: redis?.host,
          port: redis?.port,
          password: redis?.password,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
