import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQueryWithReauth } from '@/lib/baseQuery'

import type {
  AuthUser,
  DummyJSONAuthResponse,
  DummyJSONLoginRequest,
  DummyJSONRefreshResponse,
} from '@/types/api'

import { userUpdated } from './authSlice'

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
    login: builder.mutation<
      DummyJSONAuthResponse,
      DummyJSONLoginRequest
    >({
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
      async onQueryStarted(
        _arg,
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data } = await queryFulfilled

          dispatch(userUpdated(data))
        } catch {
          // RTK Query exposes the request error through the hook.
          // Nothing needs to be dispatched here.
        }
      },
    }),

    /**
     * Refresh authentication tokens.
     */
    refresh: builder.mutation<
      DummyJSONRefreshResponse,
      {
        refreshToken: string
        expiresInMins?: number
      }
    >({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useGetMeQuery,
  useRefreshMutation,
} = authApi
