import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { VoucherDiscountType } from '../types/voucher.types';

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('uq_vouchers_code', { unique: true })
  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ name: 'discount_type', type: 'enum', enum: ['percent', 'fixed'] })
  discountType: VoucherDiscountType;

  @Column({
    name: 'discount_value',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  discountValue: string;

  @Column({
    name: 'max_discount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxDiscount: string | null;

  @Column({
    name: 'min_order_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  minOrderAmount: string;

  @Column({ name: 'valid_from', type: 'timestamptz' })
  validFrom: Date;

  @Column({ name: 'valid_to', type: 'timestamptz' })
  validTo: Date;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit: number | null;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
