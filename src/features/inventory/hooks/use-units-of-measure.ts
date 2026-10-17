import { useQuery } from "@tanstack/react-query";
import { getUnitsOfMeasure } from "@/features/inventory/api/inventory-api";

export function useUnitsOfMeasure() {
  return useQuery({
    queryKey: ["inventory", "units-of-measure"],
    queryFn: getUnitsOfMeasure,
  });
}
