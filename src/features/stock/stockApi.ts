import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { withDelayParams } from '@/lib/apiClient'
import {
  mapDummyJSONToStockItem,
  type DummyJSONCategory,
  type DummyJSONProduct,
  type DummyJSONProductsResponse,
  type StockItem,
  type StockListPage,
} from '@/types/api'

export interface ProductListArgs {
  limit?: number
  skip?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  select?: string
  category?: string
  forceError?: boolean
}

export interface ProductSearchArgs {
  q: string
  limit?: number
  skip?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  forceError?: boolean
}

function toListPage(response: DummyJSONProductsResponse): StockListPage {
  return {
    items: response.products.map(mapDummyJSONToStockItem),
    total: response.total,
    skip: response.skip,
    limit: response.limit,
  }
}

function listUrl(args: ProductListArgs): {
  url: string
  params: Record<string, string | number | boolean>
} {
  if (args.forceError) {
    return { url: '/http/500', params: withDelayParams() }
  }
  const params = withDelayParams({
    limit: args.limit,
    skip: args.skip,
    sortBy: args.sortBy,
    order: args.order,
    select: args.select,
  })
  const url = args.category
    ? `/products/category/${args.category}`
    : '/products'
  return { url, params }
}

function patchQuantity(
  draft: StockItem | StockListPage | undefined,
  id: number,
  quantityOnHand: number
): void {
  if (!draft) return
  if ('items' in draft) {
    const item = draft.items.find((entry) => entry.id === id)
    if (item) item.quantityOnHand = quantityOnHand
    return
  }
  if (draft.id === id) {
    draft.quantityOnHand = quantityOnHand
  }
}

export const stockApi = createApi({
  reducerPath: 'stockApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['StockItem', 'StockList'],
  endpoints: (builder) => ({
    getProducts: builder.query<StockListPage, ProductListArgs | void>({
      query: (args) => listUrl(args ?? {}),
      transformResponse: toListPage,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({
                type: 'StockItem' as const,
                id: item.id,
              })),
              { type: 'StockList', id: 'LIST' },
            ]
          : [{ type: 'StockList', id: 'LIST' }],
    }),

    searchProducts: builder.query<StockListPage, ProductSearchArgs>({
      query: (args) => {
        if (args.forceError) {
          return { url: '/http/500', params: withDelayParams() }
        }
        return {
          url: '/products/search',
          params: withDelayParams({
            q: args.q,
            limit: args.limit,
            skip: args.skip,
            sortBy: args.sortBy,
            order: args.order,
          }),
        }
      },
      transformResponse: toListPage,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({
                type: 'StockItem' as const,
                id: item.id,
              })),
              { type: 'StockList', id: 'LIST' },
            ]
          : [{ type: 'StockList', id: 'LIST' }],
    }),

    getCategories: builder.query<DummyJSONCategory[], void>({
      query: () => ({
        url: '/products/categories',
        params: withDelayParams(),
      }),
    }),

    getProduct: builder.query<StockItem, number>({
      query: (id) => ({
        url: `/products/${id}`,
        params: withDelayParams(),
      }),
      transformResponse: (response: DummyJSONProduct) =>
        mapDummyJSONToStockItem(response),
      providesTags: (_result, _error, id) => [{ type: 'StockItem', id }],
    }),

    updateStock: builder.mutation<
      StockItem,
      { id: number; quantityOnHand: number }
    >({
      query: ({ id, quantityOnHand }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: { stock: quantityOnHand },
      }),
      transformResponse: (response: DummyJSONProduct) =>
        mapDummyJSONToStockItem(response),
      async onQueryStarted(
        { id, quantityOnHand },
        { dispatch, queryFulfilled, getState }
      ) {
        const patches = [
          dispatch(
            stockApi.util.updateQueryData('getProduct', id, (draft) => {
              patchQuantity(draft, id, quantityOnHand)
            })
          ),
        ]

        const listArgs = stockApi.util.selectCachedArgsForQuery(
          getState(),
          'getProducts'
        )
        for (const args of listArgs) {
          patches.push(
            dispatch(
              stockApi.util.updateQueryData('getProducts', args, (draft) => {
                patchQuantity(draft, id, quantityOnHand)
              })
            )
          )
        }

        const searchArgs = stockApi.util.selectCachedArgsForQuery(
          getState(),
          'searchProducts'
        )
        for (const args of searchArgs) {
          patches.push(
            dispatch(
              stockApi.util.updateQueryData('searchProducts', args, (draft) => {
                patchQuantity(draft, id, quantityOnHand)
              })
            )
          )
        }

        try {
          await queryFulfilled
        } catch {
          // Reverts all optimistic patches when the promise rejects
          patches.forEach((patch) => patch.undo())
        }
      },
    }),
  }),
})

export const {
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetCategoriesQuery,
  useGetProductQuery,
  useUpdateStockMutation,
} = stockApi
