import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Genre } from './entities/genre.entity';
import { Review } from './entities/review.entity';
import { MovieRepository } from './movie.repository';
import { ReviewRepository } from './review.repository';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Genre, Review])],
  controllers: [MovieController],
  providers: [MovieRepository, ReviewRepository, MovieService],
  exports: [MovieService],
})
export class MovieModule {}
