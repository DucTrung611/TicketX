import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CinemaService } from './cinema.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { CinemaQueryDto } from './dto/cinema-query.dto';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller({ path: 'cinemas', version: '1' })
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) {}

  @Get()
  list(@Query() query: CinemaQueryDto) {
    return this.cinemaService.list(query);
  }

  @Get(':id/rooms')
  listRooms(@Param('id', ParseUUIDPipe) id: string) {
    return this.cinemaService.listRooms(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateCinemaDto) {
    const cinema = await this.cinemaService.createCinema(dto);
    return this.cinemaService.toCinemaResponseDto(cinema);
  }

  @Post(':id/rooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createRoom(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRoomDto,
  ) {
    const room = await this.cinemaService.createRoom(id, dto);
    return this.cinemaService.toRoomResponseDto(room);
  }
}
