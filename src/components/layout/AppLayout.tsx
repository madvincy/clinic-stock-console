import { Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout, selectAuth, selectHasSession } from '@/features/auth/authSlice'
import { useGetMeQuery } from '@/features/auth/authApi'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useSlowNetworkSimulation } from '@/hooks/useSlowNetworkSimulation'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import { NetworkStatusBanner } from '@/components/layout/NetworkStatusBanner'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppFooter } from '@/components/layout/AppFooter'
import { IdleLogoutDialog } from '@/components/IdleLogoutDialog'
import { RouteMetadata } from '../RouteMetadata'

// Warn after 1 minute of inactivity, log out 30s after that if untouched.
const IDLE_WARNING_AFTER_MS = 10_000
const IDLE_COUNTDOWN_MS = 30_000

export function AppLayout() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(selectAuth)
  const hasSession = useAppSelector(selectHasSession)
  useGetMeQuery(undefined, { skip: !hasSession })

  const networkDetails = useNetworkStatus()
  const { enabled: isDelaySimulated, toggle: toggleDelaySimulation } =
    useSlowNetworkSimulation()

  const { isWarning, secondsRemaining, reset } = useIdleTimer({
    warningAfterMs: IDLE_WARNING_AFTER_MS,
    countdownMs: IDLE_COUNTDOWN_MS,
    enabled: hasSession,
    onIdle: () => dispatch(logout()),
  })

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 text-foreground">
      <RouteMetadata />
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

      <IdleLogoutDialog
        open={hasSession && isWarning}
        secondsRemaining={secondsRemaining}
        onStaySignedIn={reset}
        onLogoutNow={() => dispatch(logout())}
      />
    </div>
  )
}
