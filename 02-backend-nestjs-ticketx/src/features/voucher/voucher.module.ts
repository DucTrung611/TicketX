import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherRepository } from './voucher.repository';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher])],
  controllers: [VoucherController],
  providers: [VoucherRepository, VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
