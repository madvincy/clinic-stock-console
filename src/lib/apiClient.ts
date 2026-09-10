/**
 * Base fetch wrapper for DummyJSON.
 * Default origin is https://dummyjson.com, overridable with VITE_API_BASE_URL.
 * `delay` (or VITE_API_DELAY) is forwarded as `?delay=` for slow-response testing.
 */
import { isSlowNetworkSimulationEnabled, SIMULATED_DELAY_MS } from '@/lib/apiDelay'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com'

export const LOGIN_EXPIRES_IN_MINS = 1

export const PAGE_SIZE = 10

export function getDefaultDelayMs(): number | undefined {
  if (isSlowNetworkSimulationEnabled()) {
    return SIMULATED_DELAY_MS // returns 2000 ms
  }
  const raw = import.meta.env.VITE_API_DELAY
  if (!raw) return undefined
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function withDelayParams(
  params?: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean> {
  const delay = getDefaultDelayMs()
  const next: Record<string, string | number | boolean> = {}
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        next[key] = value
      }
    }
  }
  if (delay !== undefined && next.delay === undefined) {
    next.delay = delay
  }
  return next
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  delay?: number
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`)
    this.name = 'ApiError'
  }
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, delay } = options

  const url = new URL(endpoint, API_BASE_URL)
  const delayMs = delay ?? getDefaultDelayMs()
  if (delayMs) {
    url.searchParams.set('delay', String(delayMs))
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(url.toString(), fetchOptions)

  let data: unknown
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as Record<string, unknown>).message)
        : undefined
    )
  }

  return data as T
}

export function apiGet<T = unknown>(
  endpoint: string,
  delay?: number
): Promise<T> {
  return apiClient<T>(endpoint, { method: 'GET', delay })
}

export function apiPost<T = unknown>(
  endpoint: string,
  body?: unknown,
  delay?: number
): Promise<T> {
  return apiClient<T>(endpoint, { method: 'POST', body, delay })
}

export function apiPut<T = unknown>(
  endpoint: string,
  body?: unknown,
  delay?: number
): Promise<T> {
  return apiClient<T>(endpoint, { method: 'PUT', body, delay })
}

export function getRtkErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'message' in error.data
  ) {
    return String((error.data as { message: unknown }).message)
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 'FETCH_ERROR'
  ) {
    return 'Network error. Check your connection and try again.'
  }
  return fallback
}

/** Only same-origin relative paths; rejects protocol-relative URLs. */
export function safeRedirectTo(value: string | null | undefined): string {
  if (!value) return '/'
  const decoded = (() => {
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  })()
  if (!decoded.startsWith('/') || decoded.startsWith('//')) {
    return '/'
  }
  return decoded
}
