import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

/** Debounces typing before writing to the URL-backed search state. */
export function SearchBox({ value, onChange }: SearchBoxProps) {
  const [draft, setDraft] = useState(value)
  // Detects external value changes during render.
  const [lastSyncedValue, setLastSyncedValue] = useState(value)

  if (value !== lastSyncedValue) {
    setLastSyncedValue(value)
    setDraft(value)
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (draft !== value) onChange(draft)
    }, 300)
    return () => window.clearTimeout(handle)
  }, [draft, onChange, value])

  return (
    <div className="min-w-0 flex-1 space-y-1">
      <Label htmlFor="stock-search">Search</Label>
      <Input
        id="stock-search"
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search stock items"
        autoComplete="off"
      />
    </div>
  )
}
