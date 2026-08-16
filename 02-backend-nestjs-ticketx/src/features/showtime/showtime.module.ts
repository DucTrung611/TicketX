import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showtime } from './entities/showtime.entity';
import { ShowtimeRepository } from './showtime.repository';
import { ShowtimeService } from './showtime.service';
import { ShowtimeController } from './showtime.controller';
import { MovieModule } from '../movie/movie.module';
import { CinemaModule } from '../cinema/cinema.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Showtime]),
    MovieModule,
    CinemaModule,
    forwardRef(() => BookingModule),
  ],
  controllers: [ShowtimeController],
  providers: [ShowtimeRepository, ShowtimeService],
  exports: [ShowtimeService],
})
export class ShowtimeModule {}
