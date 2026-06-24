import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { UserRole } from '../../lib/types'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-main">
        <div className="size-8 animate-spin rounded-full border-4 border-border border-t-brand-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
