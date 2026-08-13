export class ShowtimeSeatDto {
  id: string;
  seatRow: string;
  seatNumber: number;
  seatType: string;
  price: number;
  status: 'available' | 'locked' | 'booked';
}
