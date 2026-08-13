import {
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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ShowtimeService } from './showtime.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { ShowtimeQueryDto } from './dto/showtime-query.dto';

@Controller({ path: 'showtimes', version: '1' })
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @Get()
  list(@Query() query: ShowtimeQueryDto) {
    return this.showtimeService.list(query);
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const showtime = await this.showtimeService.getByIdOrThrow(id);
    return this.showtimeService.toResponseDto(showtime);
  }

  @Get(':id/seats')
  getSeats(@Param('id', ParseUUIDPipe) id: string) {
    return this.showtimeService.getSeats(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateShowtimeDto) {
    const showtime = await this.showtimeService.create(dto);
    return this.showtimeService.toResponseDto(showtime);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShowtimeDto,
  ) {
    const showtime = await this.showtimeService.update(id, dto);
    return this.showtimeService.toResponseDto(showtime);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    await this.showtimeService.cancel(id);
  }
}
