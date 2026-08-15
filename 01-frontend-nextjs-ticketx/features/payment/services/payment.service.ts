import { apiClient, unwrap } from '@/shared/services/api-client';
import type { ApiSuccessResponse } from '@/shared/types/api-response.type';
import type {
  PaymentInitiateResponse,
  PaymentProvider,
  PaymentStatusResponse,
} from '../types/payment.types';

export function initiatePayment(
  bookingId: string,
  provider: PaymentProvider,
): Promise<PaymentInitiateResponse> {
  return unwrap(
    apiClient.post<ApiSuccessResponse<PaymentInitiateResponse>>(
      `/payments/${bookingId}/initiate`,
      { provider },
    ),
  );
}

export function getPaymentStatus(
  bookingId: string,
): Promise<PaymentStatusResponse | null> {
  return unwrap(
    apiClient.get<ApiSuccessResponse<PaymentStatusResponse | null>>(
      `/payments/${bookingId}`,
    ),
  );
}
