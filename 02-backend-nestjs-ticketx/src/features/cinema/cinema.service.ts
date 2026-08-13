import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { PaginatedResult } from '../../shared/types/paginated-result.type';
import { buildPaginationMeta } from '../../shared/utils/pagination.util';
import { CinemaRepository } from './cinema.repository';
import { RoomRepository } from './room.repository';
import { SeatRepository } from './seat.repository';
import { Cinema } from './entities/cinema.entity';
import { Room } from './entities/room.entity';
import { Seat } from './entities/seat.entity';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { CinemaQueryDto } from './dto/cinema-query.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateSeatsDto } from './dto/create-seats.dto';
import { CinemaResponseDto } from './dto/cinema-response.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { SeatResponseDto } from './dto/seat-response.dto';

@Injectable()
export class CinemaService {
  constructor(
    private readonly cinemaRepository: CinemaRepository,
    private readonly roomRepository: RoomRepository,
    private readonly seatRepository: SeatRepository,
  ) {}

  async list(
    query: CinemaQueryDto,
  ): Promise<PaginatedResult<CinemaResponseDto>> {
    const [cinemas, total] = await this.cinemaRepository.findAndCount({
      city: query.city,
      page: query.page,
      limit: query.limit,
      sortOrder: query.sortOrder,
    });

    return {
      items: cinemas.map((cinema) => this.toCinemaResponseDto(cinema)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getCinemaByIdOrThrow(id: string): Promise<Cinema> {
    const cinema = await this.cinemaRepository.findById(id);
    if (!cinema) {
      throw new NotFoundException({
        code: 'CINEMA_001',
        message: 'Cinema not found',
      });
    }
    return cinema;
  }

  async createCinema(dto: CreateCinemaDto): Promise<Cinema> {
    return this.cinemaRepository.create({
      name: dto.name,
      address: dto.address,
      city: dto.city,
      phone: dto.phone ?? null,
    });
  }

  async listRooms(cinemaId: string): Promise<RoomResponseDto[]> {
    await this.getCinemaByIdOrThrow(cinemaId);
    const rooms = await this.roomRepository.findByCinemaId(cinemaId);
    return rooms.map((room) => this.toRoomResponseDto(room));
  }

  async createRoom(cinemaId: string, dto: CreateRoomDto): Promise<Room> {
    await this.getCinemaByIdOrThrow(cinemaId);
    return this.roomRepository.create({
      cinemaId,
      name: dto.name,
      roomType: dto.roomType,
      totalSeats: 0,
    });
  }

  async getRoomByIdOrThrow(id: string): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException({
        code: 'CINEMA_002',
        message: 'Room not found',
      });
    }
    return room;
  }

  async listSeats(roomId: string): Promise<SeatResponseDto[]> {
    await this.getRoomByIdOrThrow(roomId);
    const seats = await this.seatRepository.findByRoomId(roomId);
    return seats.map((seat) => this.toSeatResponseDto(seat));
  }

  async createSeats(
    roomId: string,
    dto: CreateSeatsDto,
  ): Promise<SeatResponseDto[]> {
    const room = await this.getRoomByIdOrThrow(roomId);

    let seats: Seat[];
    try {
      seats = await this.seatRepository.createMany(
        dto.seats.map((seat) => ({
          roomId,
          seatRow: seat.seatRow.toUpperCase(),
          seatNumber: seat.seatNumber,
          seatType: seat.seatType ?? 'standard',
        })),
      );
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as unknown as { code?: string }).code === '23505'
      ) {
        throw new ConflictException({
          code: 'CINEMA_003',
          message: 'One or more seats already exist in this room',
        });
      }
      throw error;
    }

    const totalSeats = await this.seatRepository.countByRoomId(roomId);
    room.totalSeats = totalSeats;
    await this.roomRepository.save(room);

    return seats.map((seat) => this.toSeatResponseDto(seat));
  }

  toCinemaResponseDto(cinema: Cinema): CinemaResponseDto {
    return {
      id: cinema.id,
      name: cinema.name,
      address: cinema.address,
      city: cinema.city,
      phone: cinema.phone,
    };
  }

  toRoomResponseDto(room: Room): RoomResponseDto {
    return {
      id: room.id,
      cinemaId: room.cinemaId,
      name: room.name,
      roomType: room.roomType,
      totalSeats: room.totalSeats,
    };
  }

  toSeatResponseDto(seat: Seat): SeatResponseDto {
    return {
      id: seat.id,
      roomId: seat.roomId,
      seatRow: seat.seatRow,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
    };
  }
}
