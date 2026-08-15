import { TicketPage } from '@/features/booking';

export default async function TicketRoute({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <TicketPage bookingId={bookingId} />;
}
