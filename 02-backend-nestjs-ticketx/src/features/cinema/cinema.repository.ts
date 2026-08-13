import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cinema } from './entities/cinema.entity';

export interface CinemaFilter {
  city?: string;
  page: number;
  limit: number;
  sortOrder: 'asc' | 'desc';
}

@Injectable()
export class CinemaRepository {
  constructor(
    @InjectRepository(Cinema)
    private readonly repo: Repository<Cinema>,
  ) {}

  async findAndCount(filter: CinemaFilter): Promise<[Cinema[], number]> {
    const qb = this.repo
      .createQueryBuilder('cinema')
      .orderBy('cinema.name', filter.sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip((filter.page - 1) * filter.limit)
      .take(filter.limit);

    if (filter.city) {
      qb.andWhere('cinema.city = :city', { city: filter.city });
    }

    return qb.getManyAndCount();
  }

  findById(id: string): Promise<Cinema | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Cinema>): Promise<Cinema> {
    const cinema = this.repo.create(data);
    return this.repo.save(cinema);
  }
}
