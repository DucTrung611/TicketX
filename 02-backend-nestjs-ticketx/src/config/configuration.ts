export interface AppConfig {
  app: {
    env: string;
    port: number;
    corsOrigin: string;
    baseUrl: string;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  booking: {
    seatLockTtlSeconds: number;
  };
  payment: {
    webhookSecret: string;
  };
}

export default (): AppConfig => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    baseUrl:
      process.env.APP_BASE_URL ??
      `http://localhost:${process.env.PORT ?? '3000'}`,
  },
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USERNAME ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    name: process.env.DATABASE_NAME ?? 'ticketx',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  booking: {
    seatLockTtlSeconds: parseInt(
      process.env.SEAT_LOCK_TTL_SECONDS ?? '600',
      10,
    ),
  },
  payment: {
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET ?? 'dev_webhook_secret',
  },
});
