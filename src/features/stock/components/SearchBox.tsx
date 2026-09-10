import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

/**
 * Stale-response guard: the debounced value is written into the `search` URL
 * param, which becomes the RTK Query argument for `searchProducts`. Each
 * distinct `q` is its own cache key, and `useSearchProductsQuery` aborts the
 * in-flight request when args change. A slower `?delay=2000` response for an
 * older query can still land in *its* cache entry, but this component (and the
 * list) only render the cache entry for the current URL — so a late "ga"
 * payload cannot overwrite the fresher "gau" results on screen.
 */
export function SearchBox({ value, onChange }: SearchBoxProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

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
