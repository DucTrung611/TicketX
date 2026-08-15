import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from './entities/voucher.entity';

@Injectable()
export class VoucherRepository {
  constructor(
    @InjectRepository(Voucher)
    private readonly repo: Repository<Voucher>,
  ) {}

  findAll(): Promise<Voucher[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<Voucher | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByCode(code: string): Promise<Voucher | null> {
    return this.repo.findOne({ where: { code } });
  }

  create(data: Partial<Voucher>): Promise<Voucher> {
    const voucher = this.repo.create(data);
    return this.repo.save(voucher);
  }

  save(voucher: Voucher): Promise<Voucher> {
    return this.repo.save(voucher);
  }

  async incrementUsedCount(code: string): Promise<void> {
    await this.repo.increment({ code }, 'usedCount', 1);
  }
}
