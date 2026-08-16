import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Booking } from './entities/booking.entity';
import { BookingSeat } from './entities/booking-seat.entity';
import { BookingCombo } from './entities/booking-combo.entity';
import { BookingRepository } from './booking.repository';
import { BookingSeatRepository } from './booking-seat.repository';
import { BookingComboRepository } from './booking-combo.repository';
import { SeatLockService } from './seat-lock.service';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingGateway } from './booking.gateway';
import { BookingExpiryService } from './booking-expiry.service';
import { ShowtimeModule } from '../showtime/showtime.module';
import { CinemaModule } from '../cinema/cinema.module';
import { ComboModule } from '../combo/combo.module';
import { VoucherModule } from '../voucher/voucher.module';
import { AppConfig } from '../../config/configuration';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingSeat, BookingCombo]),
    forwardRef(() => ShowtimeModule),
    CinemaModule,
    ComboModule,
    VoucherModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => ({
        secret: configService.get('jwt', { infer: true })!.accessSecret,
      }),
    }),
  ],
  controllers: [BookingController],
  providers: [
    BookingRepository,
    BookingSeatRepository,
    BookingComboRepository,
    SeatLockService,
    BookingGateway,
    BookingService,
    BookingExpiryService,
  ],
  exports: [BookingService],
})
export class BookingModule {}
