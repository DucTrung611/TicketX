import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CinemaService } from './cinema.service';
import { CreateSeatsDto } from './dto/create-seats.dto';

@Controller({ path: 'rooms', version: '1' })
export class RoomController {
  constructor(private readonly cinemaService: CinemaService) {}

  @Get(':id/seats')
  listSeats(@Param('id', ParseUUIDPipe) id: string) {
    return this.cinemaService.listSeats(id);
  }

  @Post(':id/seats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createSeats(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSeatsDto,
  ) {
    return this.cinemaService.createSeats(id, dto);
  }
}
