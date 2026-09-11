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

type AppState = {
  auth: AuthState
}

type QueryArgs = string | FetchArgs

function requestUrl(args: QueryArgs): string {
  return typeof args === 'string' ? args : args.url
}

function shouldSkipReauth(args: QueryArgs): boolean {
  const url = requestUrl(args)

  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh')
  )
}

const dynamicFetch: typeof fetch = (...args) => globalThis.fetch(...args)

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  fetchFn: dynamicFetch,

  prepareHeaders: (headers, { getState }) => {
    const { accessToken } = (getState() as AppState).auth

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return headers
  },
})

function applyDelay(args: QueryArgs): QueryArgs {
  if (import.meta.env.MODE === 'test') {
    return args
  }

  const delay = getDefaultDelayMs()

  if (delay === undefined) {
    return args
  }

  const normalized: FetchArgs =
    typeof args === 'string'
      ? { url: args }
      : { ...args }

  const existingParams =
    normalized.params &&
    typeof normalized.params === 'object'
      ? normalized.params
      : {}

  return {
    ...normalized,
    params: {
      ...existingParams,
      delay,
    },
  }
}

let refreshInFlight: Promise<boolean> | null = null

function clearAuthAndStore(api: { dispatch: (action: unknown) => void }) {
  api.dispatch(logout())
  api.dispatch({ type: 'authApi/resetApiState' })
}

async function tryRefresh(
  api: Parameters<
    BaseQueryFn<
      string | FetchArgs,
      unknown,
      FetchBaseQueryError
    >
  >[1]
): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const { refreshToken } =
        (api.getState() as AppState).auth

      if (!refreshToken) {
        clearAuthAndStore(api)
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

      clearAuthAndStore(api)
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
> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(
    applyDelay(args),
    api,
    extraOptions
  )

  if (
    result.error?.status === 401 &&
    !shouldSkipReauth(args)
  ) {
    const refreshed = await tryRefresh(api)

    if (refreshed) {
      result = await rawBaseQuery(
        applyDelay(args),
        api,
        extraOptions
      )
    } else {
      clearAuthAndStore(api)
    }
  }

  return result
}

export function resetRefreshMutex(): void {
  refreshInFlight = null
}
