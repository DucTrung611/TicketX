import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Combo } from './entities/combo.entity';
import { ComboRepository } from './combo.repository';
import { ComboService } from './combo.service';
import { ComboController } from './combo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Combo])],
  controllers: [ComboController],
  providers: [ComboRepository, ComboService],
  exports: [ComboService],
})
export class ComboModule {}
