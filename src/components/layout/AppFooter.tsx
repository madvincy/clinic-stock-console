import { Wifi, WifiOff, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AppFooterProps {
  isOnline: boolean
}

export function AppFooter({ isOnline }: AppFooterProps) {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span>
            Clinic Stock Console System &copy; {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            )}
            System Status:{' '}
            <Badge
              variant="outline"
              className={
                isOnline
                  ? 'ml-1 border-emerald-500/40 py-0 text-[10px] text-emerald-600 dark:text-emerald-400'
                  : 'ml-1 border-amber-500/40 py-0 text-[10px] text-amber-600 dark:text-amber-400'
              }
            >
              {isOnline ? 'Operational' : 'Offline'}
            </Badge>
          </span>
          <span>Provider: DummyJSON API</span>
        </div>
      </div>
    </footer>
  )
}
