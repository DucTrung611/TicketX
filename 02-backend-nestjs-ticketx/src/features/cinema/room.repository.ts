import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomRepository {
  constructor(
    @InjectRepository(Room)
    private readonly repo: Repository<Room>,
  ) {}

  findByCinemaId(cinemaId: string): Promise<Room[]> {
    return this.repo.find({ where: { cinemaId }, order: { name: 'ASC' } });
  }

  findById(id: string): Promise<Room | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Room>): Promise<Room> {
    const room = this.repo.create(data);
    return this.repo.save(room);
  }

  save(room: Room): Promise<Room> {
    return this.repo.save(room);
  }
}
