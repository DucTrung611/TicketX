export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';

export interface HoldSeatsPayload {
  showtimeId: string;
  seatIds: string[];
}

export interface HoldResponse {
  lockedSeats: string[];
  expiresAt: string;
}

export interface BookingComboItemPayload {
  comboId: string;
  quantity: number;
}

export interface CreateBookingPayload {
  showtimeId: string;
  seatIds: string[];
  comboItems?: BookingComboItemPayload[];
  voucherCode?: string;
}

export interface BookingComboItem {
  comboId: string;
  quantity: number;
  price: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  showtimeId: string;
  seatIds: string[];
  comboItems: BookingComboItem[];
  discountAmount: number;
  totalAmount: number;
  expiresAt: string;
  checkedInAt: string | null;
}

export interface Ticket {
  bookingCode: string;
  qrPayload: string;
}
