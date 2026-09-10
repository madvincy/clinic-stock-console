import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PageHeading } from '@/components/PageHeading'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryErrorState } from '@/features/stock/components/QueryErrorState'
import { EmptyState } from '@/features/stock/components/EmptyState'
import { StockCorrectionForm } from '@/features/stock/components/StockCorrectionForm'
import {
  useGetProductQuery,
  useUpdateStockMutation,
} from '@/features/stock/stockApi'
import { getRtkErrorMessage } from '@/lib/apiClient'
import { showToast } from '@/lib/toast'

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 404
  )
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)
  const isValidId = Number.isInteger(numericId) && numericId > 0

  const query = useGetProductQuery(numericId, { skip: !isValidId })
  const [updateStock, updateState] = useUpdateStockMutation()

  const item = query.data

  return (
    <div className="space-y-6">
      <p>
        <Link
          to="/"
          className="text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to stock list
        </Link>
      </p>

      <AnimatePresence mode="wait">
        {!isValidId || isNotFound(query.error) ? (
          <motion.div
            key="missing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PageHeading>Item not found</PageHeading>
            <div className="mt-4">
              <EmptyState
                title="That item does not exist"
                message="DummyJSON returned an error for this id. Check the URL and try another item."
              />
            </div>
          </motion.div>
        ) : query.isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PageHeading>Item details</PageHeading>
            <div className="mt-4">
              <QueryErrorState
                title="Could not load this item"
                message={getRtkErrorMessage(
                  query.error,
                  'A network or server error occurred.'
                )}
                onRetry={() => {
                  void query.refetch()
                }}
              />
            </div>
          </motion.div>
        ) : query.isLoading || !item ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full max-w-md" />
            <Skeleton className="h-24 w-full max-w-sm" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <img
                src={item.thumbnailUrl}
                alt=""
                className="h-32 w-32 rounded-md object-cover"
              />
              <div className="min-w-0">
                <PageHeading>{item.name}</PageHeading>
                <p className="mt-2 text-sm capitalize text-muted-foreground">
                  {item.category.replaceAll('-', ' ')} · {item.availability}
                </p>
                <p className="mt-3 max-w-2xl text-sm">{item.description}</p>
                <p className="mt-3 text-sm">
                  On hand: <strong>{item.quantityOnHand}</strong>
                </p>
              </div>
            </div>

            <section aria-labelledby="correction-heading">
              <h2 id="correction-heading" className="text-lg font-semibold">
                Stock correction
              </h2>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">
                Enter the counted quantity. Saves update the in-session cache
                immediately; DummyJSON will not persist them on the server.
              </p>
              <StockCorrectionForm
                currentQuantity={item.quantityOnHand}
                isSaving={updateState.isLoading}
                onSubmit={async (quantityOnHand) => {
                  try {
                    await updateStock({
                      id: item.id,
                      quantityOnHand,
                    }).unwrap()
                    showToast({
                      variant: 'success',
                      title: 'Stock updated',
                      description: 'The new count is reflected in this session.',
                    })
                  } catch (error) {
                    showToast({
                      variant: 'error',
                      title: 'Could not save stock',
                      description: getRtkErrorMessage(
                        error,
                        'The correction was rolled back.'
                      ),
                    })
                  }
                }}
              />
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
