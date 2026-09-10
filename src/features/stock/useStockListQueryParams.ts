import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PAGE_SIZE } from '@/lib/apiClient'

export type SortOrder = 'asc' | 'desc'

export interface StockListQueryParams {
  search: string
  category: string
  sortBy: string
  order: SortOrder
  page: number
  skip: number
  limit: number
  forceError: boolean
}

const DEFAULTS: Omit<StockListQueryParams, 'skip'> = {
  search: '',
  category: '',
  sortBy: '',
  order: 'asc',
  page: 1,
  limit: PAGE_SIZE,
  forceError: false,
}

function parsePage(value: string | null): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULTS.page
  return parsed
}

function parseOrder(value: string | null): SortOrder {
  return value === 'desc' ? 'desc' : 'asc'
}

export function readStockListQueryParams(
  searchParams: URLSearchParams
): StockListQueryParams {
  const page = parsePage(searchParams.get('page'))
  const limit = DEFAULTS.limit
  return {
    search: searchParams.get('search') ?? DEFAULTS.search,
    category: searchParams.get('category') ?? DEFAULTS.category,
    sortBy: searchParams.get('sortBy') ?? DEFAULTS.sortBy,
    order: parseOrder(searchParams.get('order')),
    page,
    skip: (page - 1) * limit,
    limit,
    forceError: searchParams.get('forceError') === '1',
  }
}

export function writeStockListQueryParams(
  current: URLSearchParams,
  patch: Partial<{
    search: string
    category: string
    sortBy: string
    order: SortOrder
    page: number
  }>,
  options?: { resetPage?: boolean }
): URLSearchParams {
  const next = new URLSearchParams(current)

  const assign = (key: string, value: string | undefined, fallback: string) => {
    if (value === undefined) return
    if (value === fallback || value === '') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
  }

  assign('search', patch.search, DEFAULTS.search)
  assign('category', patch.category, DEFAULTS.category)
  assign('sortBy', patch.sortBy, DEFAULTS.sortBy)

  if (patch.order !== undefined) {
    if (patch.order === DEFAULTS.order) next.delete('order')
    else next.set('order', patch.order)
  }

  const resetPage = options?.resetPage === true
  if (resetPage) {
    next.delete('page')
  } else if (patch.page !== undefined) {
    if (patch.page === DEFAULTS.page) next.delete('page')
    else next.set('page', String(patch.page))
  }

  return next
}

export function useStockListQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo(
    () => readStockListQueryParams(searchParams),
    [searchParams]
  )

  const update = useCallback(
    (
      patch: Partial<{
        search: string
        category: string
        sortBy: string
        order: SortOrder
        page: number
      }>,
      resetPage = false
    ) => {
      setSearchParams(
        (current) => writeStockListQueryParams(current, patch, { resetPage }),
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const setSearch = useCallback(
    (search: string) => update({ search }, true),
    [update]
  )
  const setCategory = useCallback(
    (category: string) => update({ category }, true),
    [update]
  )
  const setSort = useCallback(
    (sortBy: string, order: SortOrder) => update({ sortBy, order }, true),
    [update]
  )
  const setPage = useCallback(
    (page: number) => update({ page }, false),
    [update]
  )

  return { ...params, setSearch, setCategory, setSort, setPage }
}
