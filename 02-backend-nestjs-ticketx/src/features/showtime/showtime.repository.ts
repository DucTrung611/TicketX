import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';

export interface ShowtimeFilter {
  movieId?: string;
  roomIds?: string[];
  date?: string;
  page: number;
  limit: number;
  sortOrder: 'asc' | 'desc';
}

@Injectable()
export class ShowtimeRepository {
  constructor(
    @InjectRepository(Showtime)
    private readonly repo: Repository<Showtime>,
  ) {}

  async findAndCount(filter: ShowtimeFilter): Promise<[Showtime[], number]> {
    const qb = this.repo
      .createQueryBuilder('showtime')
      .orderBy(
        'showtime.startTime',
        filter.sortOrder.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip((filter.page - 1) * filter.limit)
      .take(filter.limit);

    if (filter.movieId) {
      qb.andWhere('showtime.movieId = :movieId', { movieId: filter.movieId });
    }

    if (filter.roomIds) {
      qb.andWhere('showtime.roomId IN (:...roomIds)', {
        roomIds: filter.roomIds.length > 0 ? filter.roomIds : [null],
      });
    }

    if (filter.date) {
      qb.andWhere('DATE(showtime.startTime) = :date', { date: filter.date });
    }

    return qb.getManyAndCount();
  }

  findById(id: string): Promise<Showtime | null> {
    return this.repo.findOne({ where: { id } });
  }

  findOverlapping(
    roomId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<Showtime | null> {
    const qb = this.repo
      .createQueryBuilder('showtime')
      .where('showtime.roomId = :roomId', { roomId })
      .andWhere('showtime.status != :cancelled', { cancelled: 'cancelled' })
      .andWhere('showtime.startTime < :endTime', { endTime })
      .andWhere('showtime.endTime > :startTime', { startTime });

    if (excludeId) {
      qb.andWhere('showtime.id != :excludeId', { excludeId });
    }

    return qb.getOne();
  }

  create(data: Partial<Showtime>): Promise<Showtime> {
    const showtime = this.repo.create(data);
    return this.repo.save(showtime);
  }

  save(showtime: Showtime): Promise<Showtime> {
    return this.repo.save(showtime);
  }
}
