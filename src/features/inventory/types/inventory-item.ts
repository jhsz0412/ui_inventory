export type InventoryItem = {
  id: string;
  itemCode: string;
  name: string;
  description: string | null;
  categoryId: string;
  unitOfMeasureId: string;
  reorderLevel: number;
  isActive: boolean;
};
