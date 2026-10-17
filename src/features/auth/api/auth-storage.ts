import type { LoginResponse } from "@/features/auth/types/auth"

const AUTH_STORAGE_KEY = "inventory.auth.session"

export function readAuthSession(): LoginResponse | null {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY)

    if (!stored) return null

    const session: LoginResponse = JSON.parse(stored)

    if (
      !session.accessToken ||
      !session.expiresAtUtc ||
      !Number.isFinite(Date.parse(session.expiresAtUtc)) ||
      Date.parse(session.expiresAtUtc) <= Date.now()
    ) {
      clearAuthSession()
      return null
    }

    return session
  } catch {
    clearAuthSession()
    return null
  }
}

export function saveAuthSession(session: LoginResponse) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}