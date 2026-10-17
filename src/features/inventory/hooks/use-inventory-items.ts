import { useQuery } from "@tanstack/react-query";
import { getInventoryItems } from "@/features/inventory/api/inventory-api";

export function useInventoryItems() {
  return useQuery({
    queryKey: ["inventory", "items"],
    queryFn: getInventoryItems,
  });
}
