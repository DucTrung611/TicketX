import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import { BookingService } from './booking.service';
import { HoldSeatsDto } from './dto/hold-seats.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller({ path: 'bookings', version: '1' })
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('hold')
  @HttpCode(HttpStatus.OK)
  hold(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: HoldSeatsDto,
  ) {
    return this.bookingService.hold(currentUser.sub, dto);
  }

  @Post()
  create(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.create(currentUser.sub, dto);
  }

  @Get()
  list(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.bookingService.list(currentUser.sub, query);
  }

  @Get(':id')
  getById(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingService.getByIdOrThrow(currentUser.sub, id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.bookingService.cancel(currentUser.sub, id);
    return { message: 'Booking cancelled' };
  }

  @Get(':id/ticket')
  getTicket(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingService.getTicket(currentUser.sub, id);
  }

  @Post(':id/checkin')
  @UseGuards(RolesGuard)
  @Roles('staff', 'admin')
  checkin(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingService.checkin(id);
  }
}
