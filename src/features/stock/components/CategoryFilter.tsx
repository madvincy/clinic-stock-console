import type { DummyJSONCategory } from '@/types/api'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ALL = '__all__'

interface CategoryFilterProps {
  categories: DummyJSONCategory[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function CategoryFilter({
  categories,
  value,
  onChange,
  disabled,
}: CategoryFilterProps) {
  return (
    <div className="w-full space-y-1 sm:w-52">
      <Label htmlFor="stock-category">Category</Label>
      <Select
        value={value || ALL}
        onValueChange={(next) => onChange(next === ALL ? '' : next)}
        disabled={disabled}
      >
        <SelectTrigger id="stock-category" aria-label="Filter by category">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.slug} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
