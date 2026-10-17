import { apiRequest } from "@/services/api-client"

export type ApiHealth = {
  status: string
  application: string
  timestampUtc: string
}

export function getApiHealth() {
  return apiRequest<ApiHealth>("/health")
}