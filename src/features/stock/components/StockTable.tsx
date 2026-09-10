import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil } from 'lucide-react'
import type { StockItem } from '@/types/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { PAGE_SIZE } from '@/lib/apiClient'
import { cn } from '@/lib/utils'
import type { SortOrder } from '@/features/stock/useStockListQueryParams'
import { StockEditDialog } from '@/features/stock/components/StockEditDialog'

interface StockTableProps {
  items: StockItem[]
  isLoading: boolean
  sortBy: string
  order: SortOrder
  onSortChange: (sortBy: string, order: SortOrder) => void
}

interface Column {
  key: string
  label: string
  sortField?: string
  headerClassName?: string
}

const COLUMNS: Column[] = [
  { key: 'item', label: 'Item', sortField: 'title' },
  { key: 'category', label: 'Category' },
  { key: 'stock', label: 'Stock', sortField: 'stock' },
  { key: 'price', label: 'Price', sortField: 'price' },
  { key: 'actions', label: 'Actions', headerClassName: 'text-right' },
]

function formatPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function SortableColumnHead({
  column,
  sortBy,
  order,
  onSortChange,
}: {
  column: Column
  sortBy: string
  order: SortOrder
  onSortChange: (sortBy: string, order: SortOrder) => void
}) {
  if (!column.sortField) {
    return <TableHead className={column.headerClassName}>{column.label}</TableHead>
  }

  const isActive = sortBy === column.sortField
  const ariaSort = !isActive ? 'none' : order === 'asc' ? 'ascending' : 'descending'
  const Icon = !isActive ? ArrowUpDown : order === 'asc' ? ArrowUp : ArrowDown

  function handleClick() {
    if (!isActive) {
      onSortChange(column.sortField!, 'asc')
    } else if (order === 'asc') {
      onSortChange(column.sortField!, 'desc')
    } else {
      // Third click on the same column clears sorting back to default order.
      onSortChange('', 'asc')
    }
  }

  return (
    <TableHead aria-sort={ariaSort}>
      <button
        type="button"
        onClick={handleClick}
        className="-mx-2 -my-1 inline-flex items-center gap-1 rounded-sm px-2 py-1 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Sort by ${column.label}${
          isActive ? `, currently ${ariaSort}` : ''
        }`}
      >
        <span>{column.label}</span>
        <Icon
          aria-hidden="true"
          className={cn(
            'h-3.5 w-3.5',
            isActive ? 'text-foreground' : 'text-muted-foreground/50'
          )}
        />
      </button>
    </TableHead>
  )
}

function StockTableSkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0" />
          <Skeleton className="h-4 w-40" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="ml-auto h-8 w-8" />
      </TableCell>
    </TableRow>
  )
}

function StockTableRow({
  item,
  onEdit,
}: {
  item: StockItem
  onEdit: (item: StockItem) => void
}) {
  const navigate = useNavigate()

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={() => navigate(`/items/${item.id}`)}
      className="cursor-pointer border-b transition-colors hover:bg-muted/50"
    >
      <TableCell>
        <Link
          to={`/items/${item.id}`}
          onClick={(event) => event.stopPropagation()}
          className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src={item.thumbnailUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded object-cover"
          />
          <span className="font-medium">{item.name}</span>
        </Link>
      </TableCell>
      <TableCell className="whitespace-nowrap capitalize">
        {item.category.replaceAll('-', ' ')}
      </TableCell>
      <TableCell>{item.quantityOnHand}</TableCell>
      <TableCell className="whitespace-nowrap">
        {formatPrice(item.unitPrice)}
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(item)
          }}
          aria-label={`Edit stock for ${item.name}`}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      </TableCell>
    </motion.tr>
  )
}

export function StockTable({
  items,
  isLoading,
  sortBy,
  order,
  onSortChange,
}: StockTableProps) {
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  function handleEdit(item: StockItem) {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="overflow-x-auto rounded-md border" aria-busy={isLoading}>
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((column) => (
              <SortableColumnHead
                key={column.key}
                column={column}
                sortBy={sortBy}
                order={order}
                onSortChange={onSortChange}
              />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: PAGE_SIZE }, (_, index) => (
              <StockTableSkeletonRow key={index} />
            ))
          ) : (
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <StockTableRow key={item.id} item={item} onEdit={handleEdit} />
              ))}
            </AnimatePresence>
          )}
        </TableBody>
      </Table>

      <StockEditDialog
        item={editingItem}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  )
}