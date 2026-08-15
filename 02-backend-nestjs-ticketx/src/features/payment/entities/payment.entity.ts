import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { PaymentProvider, PaymentStatus } from '../types/payment.types';

@Entity('payments')
@Index('idx_payments_booking_id', ['bookingId'])
@Index('idx_payments_provider_transaction_id', ['providerTransactionId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ type: 'enum', enum: ['vnpay', 'momo', 'stripe'] })
  provider: PaymentProvider;

  @Column({ name: 'provider_transaction_id', type: 'varchar' })
  providerTransactionId: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
  })
  status: PaymentStatus;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
