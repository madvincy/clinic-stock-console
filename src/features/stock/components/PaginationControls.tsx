import { Button } from '@/components/ui/button'

interface PaginationControlsProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function PaginationControls({
  page,
  total,
  limit,
  onPageChange,
}: PaginationControlsProps) {
  const pageCount = Math.max(1, Math.ceil(total / limit))
  const prevButtonStatus = page > 1
  const nextButtonStatus = page < pageCount

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label="Stock list pagination"
    >
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount} ({total} items)
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!prevButtonStatus}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!nextButtonStatus}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
