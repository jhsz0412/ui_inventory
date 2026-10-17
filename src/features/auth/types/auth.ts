export type LoginRequest = {
  userNameOrEmail: string
  password: string
}

export type AuthUser = {
  id: string
  employeeId: string
  userName: string
  email: string
}

export type LoginResponse = AuthUser & {
  accessToken: string
  tokenType: string
  expiresAtUtc: string
}
