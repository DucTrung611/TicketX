import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Express } from 'express';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { ImageUploadInterceptor } from '../../shared/interceptors/image-upload.interceptor';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieQueryDto } from './dto/movie-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller({ path: 'movies', version: '1' })
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async list(@Query() query: MovieQueryDto) {
    return this.movieService.list(query);
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const movie = await this.movieService.getByIdOrThrow(id);
    return this.movieService.toResponseDto(movie);
  }

  @Get(':id/reviews')
  listReviews(@Param('id', ParseUUIDPipe) id: string) {
    return this.movieService.listReviews(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  addReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateReviewDto,
  ) {
    return this.movieService.addReview(id, currentUser.sub, dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateMovieDto) {
    const movie = await this.movieService.create(dto);
    return this.movieService.toResponseDto(movie);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMovieDto,
  ) {
    const movie = await this.movieService.update(id, dto);
    return this.movieService.toResponseDto(movie);
  }

  @Post(':id/poster')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(ImageUploadInterceptor)
  async uploadPoster(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException({
        code: 'VALIDATION_001',
        message: 'file is required',
      });
    }
    await this.movieService.setPoster(id, `/uploads/${file.filename}`);
    return { url: `/uploads/${file.filename}` };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.movieService.remove(id);
  }
}
