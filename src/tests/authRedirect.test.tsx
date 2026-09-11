import { afterEach, describe, expect, it, vi } from 'vitest'

import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { Provider } from 'react-redux'

import { render, screen, waitFor } from '@testing-library/react'

import { setupStore } from '@/app/store'
import { authApi } from '@/features/auth/authApi'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { resetRefreshMutex } from '@/lib/baseQuery'

import type { AuthState } from '@/features/auth/authSlice'

const STORAGE_KEY = 'clinic-stock-auth'

const createSession = (): AuthState => ({
  accessToken: 'valid-initial-access-token',
  refreshToken: 'valid-refresh-token',
  // Active expiration timestamp far in the future
  expiresAt: Date.now() + 1000 * 60 * 60,

  user: {
    id: 1,
    username: 'emilys',
    email: 'emily.johnson@x.dummyjson.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    gender: 'female',
    image: 'https://dummyjson.com/icon/emilys/128',
  },
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function LoginProbe() {
  const location = useLocation()

  return <div data-testid="login-probe">login:{location.search}</div>
}

function PrivatePing() {
  authApi.endpoints.getMe.useQuery()

  return <div data-testid="private-area">private-area</div>
}

describe('401 refresh failure redirects with redirectTo', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
    resetRefreshMutex()
  })

  it('redirects to login with the original path and query string', async () => {
    const session = createSession()

    // Hydrate storage prior to Redux store initialization
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof Request
            ? input.url
            : String(input)

      if (url.includes('/auth/me')) {
        return jsonResponse(
          {
            message: 'Token Expired!',
          },
          401
        )
      }

      if (url.includes('/auth/refresh')) {
        return jsonResponse(
          {
            message: 'Invalid refresh token',
          },
          401
        )
      }

      return jsonResponse(
        {
          message: 'Unhandled test request',
        },
        500
      )
    })

    vi.stubGlobal('fetch', fetchMock)

    const store = setupStore({
      auth: session,
    })

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/items/42?search=gauze&page=3']}>
          <Routes>
            <Route path="/login" element={<LoginProbe />} />

            <Route
              path="/items/:id"
              element={
                <ProtectedRoute>
                  <PrivatePing />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    // 1. Wait for both API calls (/auth/me -> 401 and /auth/refresh -> 401) to finish
    await waitFor(
      () => {
        expect(
          fetchMock.mock.calls.some(([input]) => {
            const url =
              typeof input === 'string'
                ? input
                : input instanceof Request
                  ? input.url
                  : String(input)
            return url.includes('/auth/me')
          })
        ).toBe(true)

        expect(
          fetchMock.mock.calls.some(([input]) => {
            const url =
              typeof input === 'string'
                ? input
                : input instanceof Request
                  ? input.url
                  : String(input)
            return url.includes('/auth/refresh')
          })
        ).toBe(true)
      },
      {
        timeout: 3000,
      }
    )

    // 2. Confirm Redux auth state gets cleared after refresh fails
    await waitFor(
      () => {
        expect(store.getState().auth.accessToken).toBeNull()

        expect(store.getState().auth.refreshToken).toBeNull()
      },
      {
        timeout: 3000,
      }
    )

    // 3. Confirm router redirect to /login with original query parameters
    const loginProbe = await screen.findByTestId('login-probe')

    expect(loginProbe).toBeInTheDocument()

    const loginSearch = loginProbe.textContent ?? ''
    expect(loginSearch).toContain('redirectTo=')

    const search = loginSearch.replace(/^login:/, '')
    const params = new URLSearchParams(search)

    expect(params.get('redirectTo')).toBe('/items/42?search=gauze&page=3')

    // 4. Ensure protected area is unmounted after redirect
    expect(screen.queryByTestId('private-area')).not.toBeInTheDocument()
  })
})
