import { describe, expect, it } from 'vitest'
import {
  readStockListQueryParams,
  writeStockListQueryParams,
} from '@/features/stock/useStockListQueryParams'

describe('stock list query params', () => {
  it('uses sane defaults when the URL is empty', () => {
    const params = readStockListQueryParams(new URLSearchParams())

    expect(params).toEqual({
      search: '',
      category: '',
      sortBy: '',
      order: 'asc',
      page: 1,
      skip: 0,
      limit: 10,
      forceError: false,
    })
  })

  it('resets page when the category param changes', () => {
    const current = new URLSearchParams('category=beauty&page=4&search=mask')
    const next = writeStockListQueryParams(
      current,
      { category: 'smartphones' },
      { resetPage: true }
    )

    expect(next.get('category')).toBe('smartphones')
    expect(next.get('search')).toBe('mask')
    expect(next.get('page')).toBeNull()
    expect(readStockListQueryParams(next).page).toBe(1)
    expect(readStockListQueryParams(next).skip).toBe(0)
  })

  it('round-trips a fully populated param set', () => {
    const populated = new URLSearchParams({
      search: 'gauze',
      category: 'beauty',
      sortBy: 'title',
      order: 'desc',
      page: '3',
    })

    const read = readStockListQueryParams(populated)
    expect(read.search).toBe('gauze')
    expect(read.category).toBe('beauty')
    expect(read.sortBy).toBe('title')
    expect(read.order).toBe('desc')
    expect(read.page).toBe(3)
    expect(read.skip).toBe(20)

    const written = writeStockListQueryParams(new URLSearchParams(), {
      search: read.search,
      category: read.category,
      sortBy: read.sortBy,
      order: read.order,
      page: read.page,
    })

    expect(written.get('search')).toBe('gauze')
    expect(written.get('category')).toBe('beauty')
    expect(written.get('sortBy')).toBe('title')
    expect(written.get('order')).toBe('desc')
    expect(written.get('page')).toBe('3')
  })
})
