import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Booking } from './entities/booking.entity';
import { BookingSeat } from './entities/booking-seat.entity';
import { BookingRepository } from './booking.repository';
import { BookingSeatRepository } from './booking-seat.repository';
import { SeatLockService } from './seat-lock.service';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingGateway } from './booking.gateway';
import { ShowtimeModule } from '../showtime/showtime.module';
import { CinemaModule } from '../cinema/cinema.module';
import { AppConfig } from '../../config/configuration';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingSeat]),
    ShowtimeModule,
    CinemaModule,
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
    SeatLockService,
    BookingGateway,
    BookingService,
  ],
  exports: [BookingService],
})
export class BookingModule {}
