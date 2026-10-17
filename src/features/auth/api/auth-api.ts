import { apiRequest } from "@/services/api-client"
import type {
  LoginRequest,
  LoginResponse,
} from "@/features/auth/types/auth"

export function login(request: LoginRequest) {
  return apiRequest<LoginResponse>("/api/identity/login", {
    method: "POST",
    body: request,
  })
}

export type LogoutResponse = {
  message: string
}

export function logout() {
  return apiRequest<LogoutResponse>("/api/identity/logout", {
    method: "POST",
  })
}
