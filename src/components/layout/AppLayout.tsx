import { Link, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout, selectAuth, selectHasSession } from '@/features/auth/authSlice'
import { useGetMeQuery } from '@/features/auth/authApi'
import { Button } from '@/components/ui/button'

export function AppLayout() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(selectAuth)
  const hasSession = useAppSelector(selectHasSession)
  useGetMeQuery(undefined, { skip: !hasSession })

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.username
    : 'Signed in'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clinic Stock Console
          </Link>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">{displayName}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dispatch(logout())}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
