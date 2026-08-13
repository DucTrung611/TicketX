import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MovieService } from '../movie/movie.service';
import { CinemaService } from '../cinema/cinema.service';
import { PaginatedResult } from '../../shared/types/paginated-result.type';
import { buildPaginationMeta } from '../../shared/utils/pagination.util';
import { ShowtimeRepository } from './showtime.repository';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { ShowtimeQueryDto } from './dto/showtime-query.dto';
import { ShowtimeResponseDto } from './dto/showtime-response.dto';
import { ShowtimeSeatDto } from './dto/showtime-seat.dto';

@Injectable()
export class ShowtimeService {
  constructor(
    private readonly showtimeRepository: ShowtimeRepository,
    private readonly movieService: MovieService,
    private readonly cinemaService: CinemaService,
  ) {}

  async list(
    query: ShowtimeQueryDto,
  ): Promise<PaginatedResult<ShowtimeResponseDto>> {
    let roomIds: string[] | undefined;
    if (query.cinemaId) {
      const rooms = await this.cinemaService.listRooms(query.cinemaId);
      roomIds = rooms.map((room) => room.id);
    }

    const [showtimes, total] = await this.showtimeRepository.findAndCount({
      movieId: query.movieId,
      roomIds,
      date: query.date,
      page: query.page,
      limit: query.limit,
      sortOrder: query.sortOrder,
    });

    return {
      items: showtimes.map((showtime) => this.toResponseDto(showtime)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getByIdOrThrow(id: string): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findById(id);
    if (!showtime) {
      throw new NotFoundException({
        code: 'SHOWTIME_001',
        message: 'Showtime not found',
      });
    }
    return showtime;
  }

  async create(dto: CreateShowtimeDto): Promise<Showtime> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    this.assertValidTimeRange(startTime, endTime);

    await this.movieService.getByIdOrThrow(dto.movieId);
    await this.cinemaService.getRoomByIdOrThrow(dto.roomId);
    await this.assertNoOverlap(dto.roomId, startTime, endTime);

    return this.showtimeRepository.create({
      movieId: dto.movieId,
      roomId: dto.roomId,
      startTime,
      endTime,
      basePrice: dto.basePrice.toFixed(2),
      status: 'scheduled',
    });
  }

  async update(id: string, dto: UpdateShowtimeDto): Promise<Showtime> {
    const showtime = await this.getByIdOrThrow(id);

    if (dto.movieId) {
      await this.movieService.getByIdOrThrow(dto.movieId);
    }
    if (dto.roomId) {
      await this.cinemaService.getRoomByIdOrThrow(dto.roomId);
    }

    const startTime = dto.startTime
      ? new Date(dto.startTime)
      : showtime.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : showtime.endTime;
    this.assertValidTimeRange(startTime, endTime);
    await this.assertNoOverlap(
      dto.roomId ?? showtime.roomId,
      startTime,
      endTime,
      id,
    );

    Object.assign(showtime, {
      movieId: dto.movieId ?? showtime.movieId,
      roomId: dto.roomId ?? showtime.roomId,
      startTime,
      endTime,
      basePrice:
        dto.basePrice !== undefined
          ? dto.basePrice.toFixed(2)
          : showtime.basePrice,
    });

    return this.showtimeRepository.save(showtime);
  }

  async cancel(id: string): Promise<void> {
    const showtime = await this.getByIdOrThrow(id);
    showtime.status = 'cancelled';
    await this.showtimeRepository.save(showtime);
  }

  async getSeats(showtimeId: string): Promise<ShowtimeSeatDto[]> {
    const showtime = await this.getByIdOrThrow(showtimeId);
    const seats = await this.cinemaService.listSeats(showtime.roomId);

    return seats.map((seat) => ({
      id: seat.id,
      seatRow: seat.seatRow,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      price: Number(showtime.basePrice),
      status: 'available',
    }));
  }

  private assertValidTimeRange(startTime: Date, endTime: Date): void {
    if (endTime <= startTime) {
      throw new BadRequestException({
        code: 'SHOWTIME_002',
        message: 'endTime must be after startTime',
      });
    }
  }

  private async assertNoOverlap(
    roomId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<void> {
    const overlapping = await this.showtimeRepository.findOverlapping(
      roomId,
      startTime,
      endTime,
      excludeId,
    );
    if (overlapping) {
      throw new ConflictException({
        code: 'SHOWTIME_003',
        message: 'Room is already booked for an overlapping time range',
      });
    }
  }

  toResponseDto(showtime: Showtime): ShowtimeResponseDto {
    return {
      id: showtime.id,
      movieId: showtime.movieId,
      roomId: showtime.roomId,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      basePrice: Number(showtime.basePrice),
      status: showtime.status,
    };
  }
}
