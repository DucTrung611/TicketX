export class ReviewResponseDto {
  id: string;
  movieId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}
