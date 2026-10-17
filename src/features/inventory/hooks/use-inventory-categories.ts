import { useQuery } from "@tanstack/react-query";
import { getInventoryCategories } from "@/features/inventory/api/inventory-api";

export function useInventoryCategories() {
  return useQuery({
    queryKey: ["inventory", "categories"],
    queryFn: getInventoryCategories,
  });
}
