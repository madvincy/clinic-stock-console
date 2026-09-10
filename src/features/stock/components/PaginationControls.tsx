import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

interface PaginationControlsProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

function getPageNumbers(page: number, pageCount: number): (number | 'ellipsis')[] {
  if (pageCount <= 1) return [1]

  const delta = 1
  const middle: number[] = []
  for (
    let i = Math.max(2, page - delta);
    i <= Math.min(pageCount - 1, page + delta);
    i++
  ) {
    middle.push(i)
  }

  const pages: (number | 'ellipsis')[] = [1]
  if (middle[0] > 2) pages.push('ellipsis')
  pages.push(...middle)
  if (middle[middle.length - 1] < pageCount - 1) pages.push('ellipsis')
  if (pageCount > 1) pages.push(pageCount)

  return pages
}

export function PaginationControls({
  page,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationControlsProps) {
  const pageCount = Math.max(1, Math.ceil(total / limit))
  const canGoPrev = page > 1
  const canGoNext = page < pageCount
  const pageNumbers = getPageNumbers(page, pageCount)

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)

  return (
    <nav
      className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Stock list pagination"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {rangeStart}–{rangeEnd} of {total}
        </span>
        <label htmlFor="page-size" className="ml-2 flex items-center gap-2">
          <span className="hidden sm:inline">Per page</span>
          <Select
            value={String(limit)}
            onValueChange={(next) => onLimitChange(Number(next))}
          >
            <SelectTrigger id="page-size" className="h-8 w-[72px]" aria-label="Items per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!canGoPrev}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>

        {pageNumbers.map((entry, index) =>
          entry === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Button
              key={entry}
              type="button"
              variant={entry === page ? 'default' : 'outline'}
              size="icon"
              className={cn('h-8 w-8 text-sm')}
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? 'page' : undefined}
              aria-label={`Page ${entry}`}
            >
              {entry}
            </Button>
          )
        )}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
