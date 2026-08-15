import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('booking_combos')
export class BookingCombo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'combo_id', type: 'uuid' })
  comboId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;
}
