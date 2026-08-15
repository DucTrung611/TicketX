'use client';

import { useQuery } from '@tanstack/react-query';
import { listCombos } from '../services/combo.service';

export function useCombos() {
  return useQuery({
    queryKey: ['combos'],
    queryFn: () => listCombos(),
  });
}
