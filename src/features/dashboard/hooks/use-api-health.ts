import { useQuery } from "@tanstack/react-query"
import { getApiHealth } from "@/features/dashboard/api/dashboard-api"

export function useApiHealth() {
  return useQuery({
    queryKey: ["api", "health"],
    queryFn: getApiHealth,
    staleTime: 30_000,
    retry: 1,
  })
}