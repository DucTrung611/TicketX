import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';

@Injectable()
export class SeatRepository {
  constructor(
    @InjectRepository(Seat)
    private readonly repo: Repository<Seat>,
  ) {}

  findByRoomId(roomId: string): Promise<Seat[]> {
    return this.repo.find({
      where: { roomId },
      order: { seatRow: 'ASC', seatNumber: 'ASC' },
    });
  }

  createMany(seats: Partial<Seat>[]): Promise<Seat[]> {
    const entities = this.repo.create(seats);
    return this.repo.save(entities);
  }

  countByRoomId(roomId: string): Promise<number> {
    return this.repo.count({ where: { roomId } });
  }
}
