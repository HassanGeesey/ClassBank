import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  FileText,
  Settings,
  LogOut,
  PiggyBank,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { UserRole } from '../../lib/types'

interface SidebarProps {
  role: UserRole
  onSignOut: () => void
}

const navItems = {
  super_admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/classes', icon: Users, label: 'Classes' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/contributions', icon: Wallet, label: 'Contributions' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/contributions', icon: Wallet, label: 'Contributions' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/reports', icon: FileText, label: 'Reports' },
  ],
  student: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
}

export function Sidebar({ role, onSignOut }: SidebarProps) {
  const items = navItems[role]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-slate-300">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <PiggyBank size={24} className="text-emerald-400" />
        <span className="text-lg font-semibold text-white">ClassBank</span>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
