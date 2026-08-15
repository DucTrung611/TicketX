import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Combo } from './entities/combo.entity';

@Injectable()
export class ComboRepository {
  constructor(
    @InjectRepository(Combo)
    private readonly repo: Repository<Combo>,
  ) {}

  findActive(): Promise<Combo[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Combo | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByIds(ids: string[]): Promise<Combo[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.repo.find({ where: { id: In(ids) } });
  }

  create(data: Partial<Combo>): Promise<Combo> {
    const combo = this.repo.create(data);
    return this.repo.save(combo);
  }

  save(combo: Combo): Promise<Combo> {
    return this.repo.save(combo);
  }
}
