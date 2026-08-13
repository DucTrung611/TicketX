import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cinema } from './entities/cinema.entity';
import { Room } from './entities/room.entity';
import { Seat } from './entities/seat.entity';
import { CinemaRepository } from './cinema.repository';
import { RoomRepository } from './room.repository';
import { SeatRepository } from './seat.repository';
import { CinemaService } from './cinema.service';
import { CinemaController } from './cinema.controller';
import { RoomController } from './room.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema, Room, Seat])],
  controllers: [CinemaController, RoomController],
  providers: [CinemaRepository, RoomRepository, SeatRepository, CinemaService],
  exports: [CinemaService],
})
export class CinemaModule {}
