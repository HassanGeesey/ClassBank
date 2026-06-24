import { Sidebar } from './Sidebar'
import type { UserRole } from '../../lib/types'

interface AppShellProps {
  role: UserRole
  onSignOut: () => void
  children: React.ReactNode
}

export function AppShell({ role, onSignOut, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar role={role} onSignOut={onSignOut} />
      <main className="ml-64 p-8">{children}</main>
    </div>
  )
}
