import { apiRequest } from "@/services/api-client";
import type { MenuItem } from "@/features/menu/types/menu-item";

export function getMenuItems() {
  return apiRequest<MenuItem[]>("/api/menu-items");
}
