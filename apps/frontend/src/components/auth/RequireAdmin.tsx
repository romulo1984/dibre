import { useUser } from '@clerk/clerk-react'
import { Navigate, Outlet } from 'react-router-dom'

export function RequireAdmin() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return null

  const role = (user?.publicMetadata as { role?: string })?.role

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
