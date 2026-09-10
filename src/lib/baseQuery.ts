import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import {
  API_BASE_URL,
  LOGIN_EXPIRES_IN_MINS,
  getDefaultDelayMs,
} from '@/lib/apiClient'
import {
  logout,
  sessionEstablished,
  type AuthState,
} from '@/features/auth/authSlice'

type AppState = { auth: AuthState }

function requestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url
}

function shouldSkipReauth(args: string | FetchArgs): boolean {
  const url = requestUrl(args)
  return url.includes('/auth/login') || url.includes('/auth/refresh')
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const { accessToken } = (getState() as AppState).auth
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
    return headers
  },
})

function applyDelay(args: string | FetchArgs): string | FetchArgs {
  const delay = getDefaultDelayMs()
  if (delay === undefined) return args
  const normalized: FetchArgs = typeof args === 'string' ? { url: args } : { ...args }
  const params =
    normalized.params && typeof normalized.params === 'object'
      ? { delay, ...normalized.params }
      : { delay }
  return { ...normalized, params }
}

let refreshInFlight: Promise<boolean> | null = null

async function tryRefresh(
  api: Parameters<
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
  >[1]
): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const { refreshToken } = (api.getState() as AppState).auth
      if (!refreshToken) {
        api.dispatch(logout())
        return false
      }

      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: {
            refreshToken,
            expiresInMins: LOGIN_EXPIRES_IN_MINS,
          },
        },
        api,
        {}
      )

      if (
        refreshResult.data &&
        typeof refreshResult.data === 'object' &&
        'accessToken' in refreshResult.data &&
        'refreshToken' in refreshResult.data
      ) {
        const data = refreshResult.data as {
          accessToken: string
          refreshToken: string
        }
        api.dispatch(
          sessionEstablished({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresInMins: LOGIN_EXPIRES_IN_MINS,
          })
        )
        return true
      }

      api.dispatch(logout())
      return false
    })().finally(() => {
      refreshInFlight = null
    })
  }

  return refreshInFlight
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(applyDelay(args), api, extraOptions)

  if (result.error?.status === 401 && !shouldSkipReauth(args)) {
    const refreshed = await tryRefresh(api)
    if (refreshed) {
      result = await rawBaseQuery(applyDelay(args), api, extraOptions)
    }
  }

  return result
}

/** Test-only: clear the in-flight refresh mutex between cases. */
export function resetRefreshMutex(): void {
  refreshInFlight = null
}
