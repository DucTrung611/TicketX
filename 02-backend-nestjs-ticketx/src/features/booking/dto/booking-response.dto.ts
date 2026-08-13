import type { BookingStatus } from '../types/booking.types';

export class BookingResponseDto {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  showtimeId: string;
  seatIds: string[];
  discountAmount: number;
  totalAmount: number;
  expiresAt: Date;
  checkedInAt: Date | null;
}
