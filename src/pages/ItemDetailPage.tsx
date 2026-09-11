import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Edit3, Package, X } from 'lucide-react'
import { PageHeading } from '@/components/PageHeading'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  const [isEditing, setIsEditing] = useState(false)

  const item = query.data

  useEffect(() => {
    if (!item) {
      return
    }
    document.title = `${item.name} – ${item.category} | Clinic Stock Console`
    let meta = document.head.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    )
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content =
      item.description ||
      `View stock details for ${item.name} in ${item.category}.`
    return () => {
      document.title = 'Clinic Stock Console'
    }
  }, [item])

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to stock list</span>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {!isValidId || isNotFound(query.error) ? (
          <motion.div
            key="missing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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
            className="space-y-6"
          >
            <div className="flex gap-6">
              <Skeleton className="h-40 w-40 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="relative aspect-square h-40 w-40 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <PageHeading>{item.name}</PageHeading>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {item.category.replaceAll('-', ' ')}
                          </Badge>
                          <Badge
                            variant={
                              item.availability === 'In Stock'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {item.availability}
                          </Badge>
                        </div>
                      </div>
                      {!isEditing && (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit Stock
                        </Button>
                      )}
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Quantity on hand:{' '}
                      </span>
                      <strong className="text-base font-semibold text-foreground">
                        {item.quantityOnHand}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  aria-labelledby="correction-heading"
                  className="overflow-hidden rounded-xl border border-primary/20 bg-card p-6 shadow-md"
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h2
                        id="correction-heading"
                        className="text-lg font-semibold tracking-tight"
                      >
                        Stock Correction
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Enter the updated count. Changes update the in-session
                        cache immediately.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(false)}
                      aria-label="Close edit mode"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4">
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
                            description:
                              'The new count is reflected in this session.',
                          })
                          setIsEditing(false) // Exit edit mode on success
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
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
