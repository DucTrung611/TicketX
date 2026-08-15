import { apiClient, unwrap } from '@/shared/services/api-client';
import type { ApiSuccessResponse } from '@/shared/types/api-response.type';
import type {
  Combo,
  CreateComboPayload,
  UpdateComboPayload,
} from '../types/combo.types';

export function listCombos(): Promise<Combo[]> {
  return unwrap(apiClient.get<ApiSuccessResponse<Combo[]>>('/combos'));
}

export function createCombo(payload: CreateComboPayload): Promise<Combo> {
  return unwrap(apiClient.post<ApiSuccessResponse<Combo>>('/combos', payload));
}

export function updateCombo(
  id: string,
  payload: UpdateComboPayload,
): Promise<Combo> {
  return unwrap(
    apiClient.patch<ApiSuccessResponse<Combo>>(`/combos/${id}`, payload),
  );
}
