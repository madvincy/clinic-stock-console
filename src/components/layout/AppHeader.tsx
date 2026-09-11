import type { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { BrandLink } from '@/components/layout/BrandLink'
import { ConnectivityIndicator } from '@/components/layout/ConnectivityIndicator'
import { UserMenu } from '@/components/layout/UserMenu'

interface AppHeaderProps {
  user:
    | {
        firstName?: string
        lastName?: string
        username?: string
        email?: string
        image?: string
      }
    | null
    | undefined
  isOnline: boolean
  networkDetails: ReturnType<typeof useNetworkStatus>
  isDelaySimulated: boolean
  onToggleDelaySimulation: () => void
}

export function AppHeader({
  user,
  isOnline,
  networkDetails,
  isDelaySimulated,
  onToggleDelaySimulation,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <BrandLink />
        <div className="flex items-center gap-3">
          <ConnectivityIndicator
            isOnline={isOnline}
            networkDetails={networkDetails}
            isDelaySimulated={isDelaySimulated}
            onToggleDelaySimulation={onToggleDelaySimulation}
          />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
