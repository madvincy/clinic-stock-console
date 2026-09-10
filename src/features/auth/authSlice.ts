import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser, DummyJSONAuthResponse } from '@/types/api'
import { mapAuthResponseToUser } from '@/types/api'
import { LOGIN_EXPIRES_IN_MINS } from '@/lib/apiClient'

const STORAGE_KEY = 'clinic-stock-auth'

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  user: AuthUser | null
}

const emptyState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
}

function loadPersistedAuth(): AuthState {
  if (typeof sessionStorage === 'undefined') {
    return emptyState
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw) as AuthState
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      expiresAt: parsed.expiresAt ?? null,
      user: parsed.user ?? null,
    }
  } catch {
    return emptyState
  }
}

function persistAuth(state: AuthState): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function isAccessTokenFresh(
  expiresAt: number | null,
  now = Date.now()
): boolean {
  return expiresAt !== null && now < expiresAt
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadPersistedAuth,
  reducers: {
    sessionEstablished: (
      state,
      action: PayloadAction<{
        accessToken: string
        refreshToken: string
        expiresInMins: number
        user?: AuthUser | null
      }>
    ) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.expiresAt =
        Date.now() + action.payload.expiresInMins * 60 * 1000
      if (action.payload.user !== undefined) {
        state.user = action.payload.user
      }
      persistAuth(state)
    },
    logout: () => {
      persistAuth(emptyState)
      return emptyState
    },
  },
})

export const { sessionEstablished, logout } = authSlice.actions
export const authReducer = authSlice.reducer

export function applyLoginResponse(
  response: DummyJSONAuthResponse,
  expiresInMins = LOGIN_EXPIRES_IN_MINS
) {
  return sessionEstablished({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresInMins,
    user: mapAuthResponseToUser(response),
  })
}

export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectHasSession = (state: { auth: AuthState }) =>
  Boolean(state.auth.accessToken || state.auth.refreshToken)
export const selectAccessToken = (state: { auth: AuthState }) =>
  state.auth.accessToken
export const selectIsAccessTokenFresh = (state: { auth: AuthState }) =>
  isAccessTokenFresh(state.auth.expiresAt)
