export interface Combo {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
}

export interface SelectedCombo {
  comboId: string;
  quantity: number;
}

export interface CreateComboPayload {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
}

export type UpdateComboPayload = Partial<CreateComboPayload>;
