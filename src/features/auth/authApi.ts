import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQueryWithReauth } from '@/lib/baseQuery'

import type {
  AuthUser,
  DummyJSONAuthResponse,
  DummyJSONLoginRequest,
  DummyJSONRefreshResponse,
} from '@/types/api'

import { userUpdated, logout } from './authSlice'

function isUnauthorizedError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'error' in err &&
    typeof err.error === 'object' &&
    err.error !== null &&
    'status' in err.error &&
    err.error.status === 401
  )
}

export const authApi = createApi({
  reducerPath: 'authApi',

  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({
    /**
     * Login.
     *
     * DummyJSON returns authentication tokens and basic
     * user information.
     */
    login: builder.mutation<DummyJSONAuthResponse, DummyJSONLoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    /**
     * Get the currently authenticated user.
     *
     * This endpoint is the authoritative source for the
     * complete user profile.
     */
    getMe: builder.query<AuthUser, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),

      /**
       * Once /auth/me succeeds, put the complete user into Redux.
       *
       * userUpdated() only changes state.user, so the access
       * and refresh tokens remain untouched.
       */
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled

          dispatch(userUpdated(data))
        } catch (err: unknown) {
          if (isUnauthorizedError(err)) {
            dispatch(logout())
          }
        }
      },
    }),

    /**
     * Refresh authentication tokens.
     */
    refresh: builder.mutation<DummyJSONRefreshResponse, { refreshToken: string; expiresInMins?: number }>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const { useLoginMutation, useGetMeQuery, useRefreshMutation } = authApi