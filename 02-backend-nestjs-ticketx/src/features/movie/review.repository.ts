import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(Review)
    private readonly repo: Repository<Review>,
  ) {}

  findByMovieId(movieId: string): Promise<Review[]> {
    return this.repo.find({
      where: { movieId },
      order: { createdAt: 'DESC' },
    });
  }

  create(data: Partial<Review>): Promise<Review> {
    const review = this.repo.create(data);
    return this.repo.save(review);
  }
}
