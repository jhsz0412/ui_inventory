import { apiRequest } from "@/services/api-client";
import type { MenuItem } from "@/features/menu/types/menu-item";

export type MenuItemRequest = {
  name: string;
  label: string;
  route: string | null;
  icon: string | null;
  parentMenuItemId: string | null;
  permissionId: string | null;
  sortOrder: number;
};

export function getMenuItems() {
  return apiRequest<MenuItem[]>("/api/menu-items");
}

export function getMenuItemById(id: string) {
  return apiRequest<MenuItem>(`/api/menu-items/${id}`);
}

export function createMenuItem(request: MenuItemRequest) {
  return apiRequest<MenuItem>("/api/menu-items", {
    method: "POST",
    body: request,
  });
}

export function updateMenuItem(id: string, request: MenuItemRequest) {
  return apiRequest<MenuItem>(`/api/menu-items/${id}`, {
    method: "PUT",
    body: request,
  });
}

export function deleteMenuItem(id: string) {
  return apiRequest<void>(`/api/menu-items/${id}`, {
    method: "DELETE",
  });
}
