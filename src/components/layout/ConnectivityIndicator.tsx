import { Wifi, WifiOff, Timer } from 'lucide-react'
import type { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { cn } from '@/lib/utils'

interface ConnectivityIndicatorProps {
  isOnline: boolean
  networkDetails: ReturnType<typeof useNetworkStatus>
  isDelaySimulated: boolean
  onToggleDelaySimulation: () => void
}

export function ConnectivityIndicator({
  isOnline,
  networkDetails,
  isDelaySimulated,
  onToggleDelaySimulation,
}: ConnectivityIndicatorProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1">
      <div className="flex items-center gap-1.5 text-xs font-medium">
        {isOnline ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            {/* <span className="hidden text-muted-foreground md:inline">
              {networkDetails.effectiveType.toUpperCase()}
              {networkDetails.downlink > 0 && ` (${networkDetails.downlink} Mbps)`}
            </span> */}
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden text-amber-600 dark:text-amber-400 sm:inline">
              Offline
            </span>
          </>
        )}
      </div>

      <span className="h-4 w-px bg-border" aria-hidden="true" />

      <button
        type="button"
        onClick={onToggleDelaySimulation}
        aria-pressed={isDelaySimulated}
        title={
          isDelaySimulated
            ? 'Click to stop simulating a slow network'
            : 'Click to simulate a slow network (adds request delay)'
        }
        className={cn(
          'flex items-center gap-1.5 rounded-full px-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isDelaySimulated
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Timer className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">
          {isDelaySimulated ? 'Slow network on' : 'Simulate slow network'}
        </span>
      </button>
    </div>
  )
}