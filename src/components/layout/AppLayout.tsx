import { Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectAuth, selectHasSession } from '@/features/auth/authSlice'
import { useGetMeQuery } from '@/features/auth/authApi'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useSlowNetworkSimulation } from '@/hooks/useSlowNetworkSimulation'
import { NetworkStatusBanner } from '@/components/layout/NetworkStatusBanner'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppFooter } from '@/components/layout/AppFooter'

export function AppLayout() {
  const { user } = useAppSelector(selectAuth)
  const hasSession = useAppSelector(selectHasSession)
  useGetMeQuery(undefined, { skip: !hasSession })

  const networkDetails = useNetworkStatus()
  const { enabled: isDelaySimulated, toggle: toggleDelaySimulation } =
    useSlowNetworkSimulation()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 text-foreground">
      <NetworkStatusBanner isOnline={networkDetails.isOnline} />

      <AppHeader
        user={user}
        isOnline={networkDetails.isOnline}
        networkDetails={networkDetails}
        isDelaySimulated={isDelaySimulated}
        onToggleDelaySimulation={toggleDelaySimulation}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <AppFooter isOnline={networkDetails.isOnline} />
    </div>
  )
}
