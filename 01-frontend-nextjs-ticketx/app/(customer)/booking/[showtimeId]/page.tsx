import { BookingPage } from '@/features/booking';

export default async function BookingRoute({
  params,
}: {
  params: Promise<{ showtimeId: string }>;
}) {
  const { showtimeId } = await params;
  return <BookingPage showtimeId={showtimeId} />;
}
