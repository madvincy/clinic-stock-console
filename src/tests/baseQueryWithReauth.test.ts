import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { setupStore } from '@/app/store'
import { authApi } from '@/features/auth/authApi'
import { resetRefreshMutex } from '@/lib/baseQuery'
import type { AuthState } from '@/features/auth/authSlice'

const session: AuthState = {
  accessToken: 'expired-access',
  refreshToken: 'refresh-token',
  expiresAt: Date.now() - 1000,
  user: {
    id: 1,
    username: 'emilys',
    email: 'emily.johnson@x.dummyjson.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    gender: 'female',
    image: 'https://dummyjson.com/icon/emilys/128',
  },
}

function jsonResponse(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  )
}

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()
  if (typeof Request !== 'undefined' && input instanceof Request)
    return input.url
  return String((input as { url?: string }).url || input)
}

describe('baseQueryWithReauth', () => {
  beforeEach(() => {
    resetRefreshMutex()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('retries the original request after a successful refresh on 401', async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = getRequestUrl(input)
        if (url.includes('/auth/me')) {
          const headers = new Headers(
            init?.headers ||
              (input instanceof Request ? input.headers : undefined)
          )
          if (headers.get('Authorization') === 'Bearer expired-access') {
            return jsonResponse({ message: 'Token Expired!' }, 401)
          }
          if (headers.get('Authorization') === 'Bearer new-access') {
            return jsonResponse({
              id: 1,
              username: 'emilys',
              email: 'emily.johnson@x.dummyjson.com',
              firstName: 'Emily',
              lastName: 'Johnson',
              gender: 'female',
              image: 'https://dummyjson.com/icon/emilys/128',
            })
          }
        }
        if (url.includes('/auth/refresh')) {
          return jsonResponse({
            accessToken: 'new-access',
            refreshToken: 'new-refresh',
          })
        }
        return jsonResponse({ message: 'unhandled' }, 500)
      }
    )
    vi.stubGlobal('fetch', fetchMock)

    const store = setupStore({ auth: session })
    await store.dispatch(
      authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })
    )

    await waitFor(() => {
      expect(store.getState().auth.accessToken).toBe('new-access')
    })

    const me = authApi.endpoints.getMe.select()(store.getState())
    expect(me.data?.username).toBe('emilys')
    expect(
      fetchMock.mock.calls.some((call) =>
        getRequestUrl(call[0]).includes('/auth/refresh')
      )
    ).toBe(true)
  })

  it('logs out when refresh fails after a 401', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = getRequestUrl(input)
      if (url.includes('/auth/me')) {
        return jsonResponse({ message: 'Token Expired!' }, 401)
      }
      if (url.includes('/auth/refresh')) {
        return jsonResponse({ message: 'Invalid refresh token' }, 401)
      }
      return jsonResponse({ message: 'unhandled' }, 500)
    })
    vi.stubGlobal('fetch', fetchMock)

    const store = setupStore({ auth: session })

    await store.dispatch(
      authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })
    )

    await waitFor(() => {
      expect(store.getState().auth.accessToken).toBeNull()
      expect(store.getState().auth.refreshToken).toBeNull()
    })
  })
})
