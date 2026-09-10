import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SortOrder } from '@/features/stock/useStockListQueryParams'

const SORT_NONE = '__none__'

interface SortControlProps {
  sortBy: string
  order: SortOrder
  onChange: (sortBy: string, order: SortOrder) => void
}

export function SortControl({ sortBy, order, onChange }: SortControlProps) {
  const combined = sortBy ? `${sortBy}:${order}` : SORT_NONE

  return (
    <div className="w-full space-y-1 sm:w-56">
      <Label htmlFor="stock-sort">Sort</Label>
      <Select
        value={combined}
        onValueChange={(next) => {
          if (next === SORT_NONE) {
            onChange('', 'asc')
            return
          }
          const [field, nextOrder] = next.split(':')
          onChange(field, nextOrder === 'desc' ? 'desc' : 'asc')
        }}
      >
        <SelectTrigger id="stock-sort" aria-label="Sort stock list">
          <SelectValue placeholder="Default order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SORT_NONE}>Default</SelectItem>
          <SelectItem value="title:asc">Name A–Z</SelectItem>
          <SelectItem value="title:desc">Name Z–A</SelectItem>
          <SelectItem value="stock:asc">Stock low–high</SelectItem>
          <SelectItem value="stock:desc">Stock high–low</SelectItem>
          <SelectItem value="price:asc">Price low–high</SelectItem>
          <SelectItem value="price:desc">Price high–low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
