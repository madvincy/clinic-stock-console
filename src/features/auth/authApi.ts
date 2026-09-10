import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import type {
  AuthUser,
  DummyJSONAuthResponse,
  DummyJSONRefreshResponse,
} from '@/types/api'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<
      DummyJSONAuthResponse,
      { username: string; password: string; expiresInMins?: number }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    getMe: builder.query<AuthUser, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
    }),

    refresh: builder.mutation<
      DummyJSONRefreshResponse,
      { refreshToken: string; expiresInMins?: number }
    >({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const { useLoginMutation, useGetMeQuery, useRefreshMutation } = authApi
