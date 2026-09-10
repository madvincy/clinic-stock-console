import { describe, expect, it, afterEach, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { render, waitFor, screen } from '@testing-library/react'
import { setupStore } from '@/app/store'
import { authApi } from '@/features/auth/authApi'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
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

function LoginProbe() {
  const location = useLocation()
  return <div>login:{location.search}</div>
}

function PrivatePing() {
  authApi.endpoints.getMe.useQuery()
  return <div>private-area</div>
}

describe('401 refresh failure redirects with redirectTo', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    resetRefreshMutex()
  })

  it('sends the user to /login preserving path and query params', async () => {
    vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/auth/me')) {
        return jsonResponse({ message: 'Token Expired!' }, 401)
      }
      if (url.includes('/auth/refresh')) {
        return jsonResponse({ message: 'Invalid refresh token' }, 401)
      }
      return jsonResponse({ message: 'unhandled' }, 500)
    })

    const store = setupStore({ auth: session })

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

    await waitFor(() => {
      expect(screen.getByText(/login:/)).toBeInTheDocument()
    })

    expect(screen.getByText(/login:/).textContent).toContain(
      'redirectTo='
    )
    expect(decodeURIComponent(screen.getByText(/login:/).textContent ?? '')).toContain(
      '/items/42?search=gauze&page=3'
    )
  })
})
