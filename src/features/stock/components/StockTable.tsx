import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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
import { PAGE_SIZE } from '@/lib/apiClient'

interface StockTableProps {
  items: StockItem[]
  isLoading: boolean
}

const COLUMNS = ['Item', 'Category', 'Stock', 'Price'] as const

function formatPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
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
    </TableRow>
  )
}

function StockTableRow({ item }: { item: StockItem }) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="border-b transition-colors hover:bg-muted/50"
    >
      <TableCell>
        <Link
          to={`/items/${item.id}`}
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
    </motion.tr>
  )
}

export function StockTable({ items, isLoading }: StockTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border" aria-busy={isLoading}>
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableHead key={column}>{column}</TableHead>
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
                <StockTableRow key={item.id} item={item} />
              ))}
            </AnimatePresence>
          )}
        </TableBody>
      </Table>
    </div>
  )
}