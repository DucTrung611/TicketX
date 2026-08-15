import { create } from 'zustand';
import type { SelectedCombo } from '@/features/combo';

interface BookingState {
  selectedSeatIds: string[];
  holdExpiresAt: string | null;
  selectedCombos: SelectedCombo[];
  voucherCode: string | null;
  discountAmount: number;
  toggleSeat: (seatId: string) => void;
  setHold: (seatIds: string[], expiresAt: string) => void;
  setComboQuantity: (comboId: string, quantity: number) => void;
  applyVoucher: (code: string, discountAmount: number) => void;
  clearVoucher: () => void;
  clearSelection: () => void;
}

export const useBookingStore = create<BookingState>()((set) => ({
  selectedSeatIds: [],
  holdExpiresAt: null,
  selectedCombos: [],
  voucherCode: null,
  discountAmount: 0,
  toggleSeat: (seatId) =>
    set((state) => ({
      selectedSeatIds: state.selectedSeatIds.includes(seatId)
        ? state.selectedSeatIds.filter((id) => id !== seatId)
        : [...state.selectedSeatIds, seatId],
    })),
  setHold: (seatIds, expiresAt) =>
    set({ selectedSeatIds: seatIds, holdExpiresAt: expiresAt }),
  setComboQuantity: (comboId, quantity) =>
    set((state) => {
      const rest = state.selectedCombos.filter((item) => item.comboId !== comboId);
      return {
        selectedCombos: quantity > 0 ? [...rest, { comboId, quantity }] : rest,
      };
    }),
  applyVoucher: (code, discountAmount) =>
    set({ voucherCode: code, discountAmount }),
  clearVoucher: () => set({ voucherCode: null, discountAmount: 0 }),
  clearSelection: () =>
    set({
      selectedSeatIds: [],
      holdExpiresAt: null,
      selectedCombos: [],
      voucherCode: null,
      discountAmount: 0,
    }),
}));
