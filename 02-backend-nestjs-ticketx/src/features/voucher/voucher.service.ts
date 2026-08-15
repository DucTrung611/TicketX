import { ConflictException, Injectable } from '@nestjs/common';
import { VoucherRepository } from './voucher.repository';
import { Voucher } from './entities/voucher.entity';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import {
  VoucherResponseDto,
  VoucherValidationResponseDto,
} from './dto/voucher-response.dto';

export interface VoucherValidationResult {
  voucher: Voucher;
  discountAmount: number;
}

@Injectable()
export class VoucherService {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async list(): Promise<VoucherResponseDto[]> {
    const vouchers = await this.voucherRepository.findAll();
    return vouchers.map((voucher) => this.toResponseDto(voucher));
  }

  async create(dto: CreateVoucherDto): Promise<Voucher> {
    const existing = await this.voucherRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException({
        code: 'VOUCHER_002',
        message: 'A voucher with this code already exists',
      });
    }

    return this.voucherRepository.create({
      code: dto.code,
      discountType: dto.discountType,
      discountValue: dto.discountValue.toFixed(2),
      maxDiscount:
        dto.maxDiscount !== undefined ? dto.maxDiscount.toFixed(2) : null,
      minOrderAmount: (dto.minOrderAmount ?? 0).toFixed(2),
      validFrom: new Date(dto.validFrom),
      validTo: new Date(dto.validTo),
      usageLimit: dto.usageLimit ?? null,
      usedCount: 0,
    });
  }

  async validate(
    code: string,
    orderAmount: number,
  ): Promise<VoucherValidationResponseDto> {
    const { discountAmount } = await this.validateForOrder(code, orderAmount);
    return {
      code,
      valid: true,
      discountAmount,
      finalAmount: Number((orderAmount - discountAmount).toFixed(2)),
    };
  }

  /**
   * Used both by `POST /vouchers/validate` and internally by `features/booking`
   * when a `voucherCode` is supplied to `POST /bookings`. Throws `VOUCHER_001`
   * (409) for any invalid state — not found, outside the valid window, usage
   * limit reached, or order amount below the minimum.
   */
  async validateForOrder(
    code: string,
    orderAmount: number,
  ): Promise<VoucherValidationResult> {
    const voucher = await this.voucherRepository.findByCode(code);
    if (!voucher) {
      throw new ConflictException({
        code: 'VOUCHER_001',
        message: 'Voucher code is invalid',
      });
    }

    const now = new Date();
    if (now < voucher.validFrom || now > voucher.validTo) {
      throw new ConflictException({
        code: 'VOUCHER_001',
        message: 'Voucher has expired or is not yet valid',
      });
    }

    if (
      voucher.usageLimit !== null &&
      voucher.usedCount >= voucher.usageLimit
    ) {
      throw new ConflictException({
        code: 'VOUCHER_001',
        message: 'Voucher usage limit reached',
      });
    }

    if (orderAmount < Number(voucher.minOrderAmount)) {
      throw new ConflictException({
        code: 'VOUCHER_001',
        message: `Order amount must be at least ${voucher.minOrderAmount} to use this voucher`,
      });
    }

    const discountAmount = this.computeDiscount(voucher, orderAmount);

    return { voucher, discountAmount };
  }

  /**
   * Increments `used_count`. Called by `features/booking` after a booking that
   * used this voucher has been successfully persisted — never before, so a
   * failed booking attempt doesn't burn a redemption.
   */
  async incrementUsage(code: string): Promise<void> {
    await this.voucherRepository.incrementUsedCount(code);
  }

  private computeDiscount(voucher: Voucher, orderAmount: number): number {
    if (voucher.discountType === 'fixed') {
      return Math.min(Number(voucher.discountValue), orderAmount);
    }

    const raw = (orderAmount * Number(voucher.discountValue)) / 100;
    const capped =
      voucher.maxDiscount !== null
        ? Math.min(raw, Number(voucher.maxDiscount))
        : raw;
    return Math.min(capped, orderAmount);
  }

  toResponseDto(voucher: Voucher): VoucherResponseDto {
    return {
      id: voucher.id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: Number(voucher.discountValue),
      maxDiscount:
        voucher.maxDiscount !== null ? Number(voucher.maxDiscount) : null,
      minOrderAmount: Number(voucher.minOrderAmount),
      validFrom: voucher.validFrom,
      validTo: voucher.validTo,
      usageLimit: voucher.usageLimit,
      usedCount: voucher.usedCount,
    };
  }
}
