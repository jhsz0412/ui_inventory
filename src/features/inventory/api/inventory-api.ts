import { apiRequest } from "@/services/api-client";
import type { InventoryItem } from "@/features/inventory/types/inventory-item";
import type { InventoryCategory } from "@/features/inventory/types/inventory-category";
import type { UnitOfMeasure } from "@/features/inventory/types/unit-of-measure";

export function getInventoryItems() {
  return apiRequest<InventoryItem[]>("/api/inventory/items");
}

export function getInventoryCategories() {
  return apiRequest<InventoryCategory[]>("/api/inventory/categories");
}

export function getUnitsOfMeasure() {
  return apiRequest<UnitOfMeasure[]>("/api/inventory/units-of-measure");
}

export type CreateInventoryItemRequest = {
  itemCode: string;
  name: string;
  categoryId: string;
  unitOfMeasureId: string;
  description: string | null;
  reorderLevel: number;
};

export function createInventoryItem(request: CreateInventoryItemRequest) {
  return apiRequest<InventoryItem>("/api/inventory/items", {
    method: "POST",
    body: request,
  });
}

export type UpdateInventoryItemRequest = {
  name: string;
  description: string | null;
  categoryId: string;
  unitOfMeasureId: string;
  reorderLevel: number;
};

export function updateInventoryItem(
  id: string,
  request: UpdateInventoryItemRequest,
) {
  return apiRequest<InventoryItem>(`/api/inventory/items/${id}`, {
    method: "PUT",
    body: request,
  });
}

export function deleteInventoryItem(id: string) {
  return apiRequest<void>(`/api/inventory/items/${id}`, {
    method: "DELETE",
  });
}

export function restoreInventoryItem(id: string) {
  return apiRequest<void>(`/api/inventory/items/${id}/restore`, {
    method: "PUT",
  });
}

export function permanentlyDeleteInventoryItem(id: string) {
  return apiRequest<void>(`/api/inventory/items/${id}/permanent`, {
    method: "DELETE",
  });
}
