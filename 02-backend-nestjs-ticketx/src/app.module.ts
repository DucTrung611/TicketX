import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './core/database/database.module';
import { RedisModule } from './core/cache/redis.module';
import { LoggerModule } from './core/logger/logger.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './features/user/user.module';
import { AuthModule } from './features/auth/auth.module';
import { MovieModule } from './features/movie/movie.module';
import { CinemaModule } from './features/cinema/cinema.module';
import { ShowtimeModule } from './features/showtime/showtime.module';
import { BookingModule } from './features/booking/booking.module';
import { PaymentModule } from './features/payment/payment.module';
import { ComboModule } from './features/combo/combo.module';
import { VoucherModule } from './features/voucher/voucher.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    LoggerModule,
    DatabaseModule,
    RedisModule,
    SharedModule,
    UserModule,
    AuthModule,
    MovieModule,
    CinemaModule,
    ShowtimeModule,
    BookingModule,
    PaymentModule,
    ComboModule,
    VoucherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
