import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppSelector } from '@/app/hooks'
import { selectHasSession } from '@/features/auth/authSlice'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const hasSession = useAppSelector(selectHasSession)
  const location = useLocation()

  if (!hasSession) {
    const redirectTo = `${location.pathname}${location.search}`
    return (
      <Navigate
        to={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
        replace
      />
    )
  }

  return children
}
