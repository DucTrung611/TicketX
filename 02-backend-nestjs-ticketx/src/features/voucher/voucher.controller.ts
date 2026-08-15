import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';

@Controller({ path: 'vouchers', version: '1' })
@UseGuards(JwtAuthGuard)
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body() dto: ValidateVoucherDto) {
    return this.voucherService.validate(dto.code, dto.orderAmount);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  list() {
    return this.voucherService.list();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateVoucherDto) {
    const voucher = await this.voucherService.create(dto);
    return this.voucherService.toResponseDto(voucher);
  }
}
