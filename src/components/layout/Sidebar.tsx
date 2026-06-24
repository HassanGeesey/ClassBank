import { useTranslation } from 'react-i18next'
import { useAuth } from '../../features/auth/AuthContext'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  FileText,
  Settings,
  LogOut,
  Globe,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { UserRole } from '../../lib/types'

interface SidebarProps {
  role: UserRole
  onSignOut: () => void
}

const navItems: Record<UserRole, { to: string; icon: any; key: string }[]> = {
  super_admin: [
    { to: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { to: '/classes', icon: Users, key: 'classes' },
    { to: '/students', icon: Users, key: 'students' },
    { to: '/contributions', icon: Wallet, key: 'contributions' },
    { to: '/expenses', icon: Receipt, key: 'expenses' },
    { to: '/reports', icon: FileText, key: 'reports' },
    { to: '/settings', icon: Settings, key: 'settings' },
  ],
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { to: '/students', icon: Users, key: 'students' },
    { to: '/contributions', icon: Wallet, key: 'contributions' },
    { to: '/expenses', icon: Receipt, key: 'expenses' },
    { to: '/reports', icon: FileText, key: 'reports' },
  ],
  student: [
    { to: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { to: '/settings', icon: Settings, key: 'settings' },
  ],
}

export { navItems }

export function Sidebar({ role, onSignOut }: SidebarProps) {
  const { t, i18n } = useTranslation()
  const { adminClasses, activeClassId, setActiveClassId } = useAuth()
  const items = navItems[role]

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'so', label: 'Soomaali' },
  ]

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 bg-bg-sidebar text-text flex-col border-r border-border">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <img src="/classBankLogo.png" alt={t('app.name')} className="h-8 w-auto" />
        <span className="text-lg font-semibold text-text">{t('app.name')}</span>
      </div>

      {adminClasses.length > 0 && (
        <div className="px-4 pt-4">
          <label className="text-xs text-muted mb-1 block">{t('nav.activeClass')}</label>
          <select
            value={activeClassId ?? ''}
            onChange={(e) => setActiveClassId(e.target.value || null)}
            className="w-full rounded-btn border border-border bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-600/30"
          >
            {adminClasses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <nav className="flex flex-col gap-1 p-4 pt-4 flex-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-btn px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-secondary hover:bg-bg-elevated hover:text-text',
              )
            }
          >
            <item.icon size={18} />
            {t(`nav.${item.key}`)}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-muted" />
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="flex-1 rounded-btn border border-border bg-white px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-600/30"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-btn px-3 py-2 text-sm font-medium text-secondary hover:bg-bg-elevated hover:text-text transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          {t('nav.signOut')}
        </button>
      </div>
    </aside>
  )
}
