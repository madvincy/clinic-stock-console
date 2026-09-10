import { AnimatePresence, motion } from 'framer-motion'
import { PageHeading } from '@/components/PageHeading'
import { SearchBox } from '@/features/stock/components/SearchBox'
import { CategoryFilter } from '@/features/stock/components/CategoryFilter'
import { SortControl } from '@/features/stock/components/SortControl'
import { StockTable } from '@/features/stock/components/StockTable'
import { PaginationControls } from '@/features/stock/components/PaginationControls'
import { QueryErrorState } from '@/features/stock/components/QueryErrorState'
import { EmptyState } from '@/features/stock/components/EmptyState'
import { useStockListQueryParams } from '@/features/stock/useStockListQueryParams'
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useSearchProductsQuery,
} from '@/features/stock/stockApi'
import { getRtkErrorMessage } from '@/lib/apiClient'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function StockListPage() {
  const {
    search,
    category,
    sortBy,
    order,
    page,
    skip,
    limit,
    forceError,
    setSearch,
    setCategory,
    setSort,
    setPage,
    setLimit,
    setForceError,
  } = useStockListQueryParams()

  const categoriesQuery = useGetCategoriesQuery()
  const isSearch = search.trim().length > 0

  const listQuery = useGetProductsQuery(
    {
      limit,
      skip,
      sortBy: sortBy || undefined,
      order: sortBy ? order : undefined,
      category: category || undefined,
      forceError,
    },
    { skip: isSearch }
  )

  const searchQuery = useSearchProductsQuery(
    {
      q: search.trim(),
      limit,
      skip,
      sortBy: sortBy || undefined,
      order: sortBy ? order : undefined,
      forceError,
    },
    { skip: !isSearch }
  )

  const activeQuery = isSearch ? searchQuery : listQuery
  const items = activeQuery.data?.items ?? []
  const total = activeQuery.data?.total ?? 0
  const isLoading = activeQuery.isLoading || activeQuery.isFetching
  const isError = activeQuery.isError

  let emptyTitle = 'No stock on file'
  let emptyMessage = 'There are no items in inventory yet.'
  if (isSearch) {
    emptyTitle = 'No matching items'
    emptyMessage = `Nothing matched “${search.trim()}”. Try a different search.`
  } else if (category) {
    emptyTitle = 'Empty category'
    emptyMessage = `No items in “${category.replaceAll('-', ' ')}”. Choose another category.`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <PageHeading>Stock list</PageHeading>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter, and correct clinic inventory.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <Switch
            id="force-error"
            checked={forceError}
            onCheckedChange={setForceError}
            aria-describedby="force-error-hint"
          />
          <Label htmlFor="force-error" className="cursor-pointer text-sm">
            Force 500 error
          </Label>
        </div>
      </div>
      <p id="force-error-hint" className="sr-only">
        When enabled, stock requests are routed through /http/500 to test the
        error state.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <SearchBox value={search} onChange={setSearch} />
        <CategoryFilter
          categories={categoriesQuery.data ?? []}
          value={category}
          onChange={setCategory}
          disabled={categoriesQuery.isLoading}
        />
        <SortControl sortBy={sortBy} order={order} onChange={setSort} />
      </div>

      <AnimatePresence mode="wait">
        {isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QueryErrorState
              title="Could not load stock"
              message={getRtkErrorMessage(
                activeQuery.error,
                'The stock service returned an error.'
              )}
              onRetry={() => {
                void activeQuery.refetch()
              }}
            />
          </motion.div>
        ) : isLoading && items.length === 0 ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StockTable items={[]} isLoading sortBy={sortBy} order={order} onSortChange={setSort} />
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState title={emptyTitle} message={emptyMessage} />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <StockTable items={items} isLoading={false} sortBy={sortBy} order={order} onSortChange={setSort} />
            <PaginationControls
              page={page}
              total={total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}