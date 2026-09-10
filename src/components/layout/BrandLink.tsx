import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export function BrandLink() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 text-base font-bold tracking-tight text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Building2 className="h-4 w-4" />
      </div>
      <span className="hidden sm:inline">Clinic Stock Console</span>
    </Link>
  )
}