import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { login as loginRequest, logout as logoutRequest, } from "@/features/auth/api/auth-api"
import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from "@/features/auth/api/auth-storage"
import type { LoginResponse } from "@/features/auth/types/auth"
import { AuthContext, type AuthContextValue } from "@/features/auth/hooks/auth-context"

type AuthProviderProps = {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<LoginResponse | null>(
    () => readAuthSession(),
  )

  const login = useCallback(async (request: Parameters<AuthContextValue["login"]>[0]) => {
    const result = await loginRequest(request)

    saveAuthSession(result)
    setSession(result)
  }, [])

const logout = useCallback(async () => {
  try {
    await logoutRequest()
  } catch {
    // Still clear the local session if the API request fails.
  } finally {
    clearAuthSession()
    setSession(null)
  }
}, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session
        ? {
            id: session.id,
            employeeId: session.employeeId,
            userName: session.userName,
            email: session.email,
          }
        : null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}