import type { BookingStatus } from '../types/booking.types';

export class BookingComboItemResponseDto {
  comboId: string;
  quantity: number;
  price: number;
}

export class BookingResponseDto {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  showtimeId: string;
  seatIds: string[];
  comboItems: BookingComboItemResponseDto[];
  discountAmount: number;
  totalAmount: number;
  expiresAt: Date;
  checkedInAt: Date | null;
}
