import { CheckoutPage } from '@/features/payment';

export default async function CheckoutRoute({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <CheckoutPage bookingId={bookingId} />;
}
