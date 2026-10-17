import { useQuery } from "@tanstack/react-query";
import { getMenuItems } from "@/features/menu/api/menu-api";

export const menuItemsQueryKey = ["menu-items"] as const;

export function useMenuItems() {
  return useQuery({
    queryKey: menuItemsQueryKey,
    queryFn: getMenuItems,
    select: (items) => items.filter((item) => item.isActive),
  });
}
