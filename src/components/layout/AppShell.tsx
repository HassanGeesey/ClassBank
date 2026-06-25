import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { Sidebar, navItems } from './Sidebar'
import { useAuth } from '../../features/auth/AuthContext'
import { cn } from '../../lib/utils'
import {
  MoreHorizontal,
  X,
  LogOut,
  Globe,
} from 'lucide-react'
import type { UserRole } from '../../lib/types'

interface AppShellProps {
  role: UserRole
  onSignOut: () => void
  children: React.ReactNode
}

function BottomNav({ role, onSignOut }: { role: UserRole; onSignOut: () => void }) {
  const { t, i18n } = useTranslation()
  const [showMore, setShowMore] = useState(false)
  const items = navItems[role]
  const maxVisible = 5
  const visible = items.slice(0, maxVisible)
  const overflow = items.slice(maxVisible)
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'so', label: 'Soomaali' },
  ]

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-card border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-1 px-2 rounded-btn transition-colors min-w-0',
                  isActive ? 'text-brand-600' : 'text-muted hover:text-text',
                )
              }
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium leading-tight">{t(`nav.${item.key}`)}</span>
            </NavLink>
          ))}
          {overflow.length > 0 && (
            <button
              onClick={() => setShowMore(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-btn text-muted hover:text-text transition-colors cursor-pointer"
            >
              <MoreHorizontal size={20} />
              <span className="text-[10px] font-medium leading-tight">{t('nav.settings')}</span>
            </button>
          )}
        </div>
      </nav>

      {showMore && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-bg-card border-t border-border rounded-t-card p-4 pb-20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-text">{t('nav.settings')}</span>
              <button onClick={() => setShowMore(false)} className="p-1 text-muted hover:text-text cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-1">
              {overflow.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'bg-brand-50 text-brand-600' : 'text-secondary hover:bg-bg-elevated hover:text-text',
                    )
                  }
                >
                  <item.icon size={18} />
                  {t(`nav.${item.key}`)}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 mt-4">
              <Globe size={16} className="text-muted shrink-0" />
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
              onClick={() => { setShowMore(false); onSignOut() }}
              className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-secondary hover:bg-bg-elevated hover:text-text transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              {t('nav.signOut')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function MobileTopBar({ onSignOut }: { onSignOut: () => void }) {
  const { t } = useTranslation()
  const { adminClasses, activeClassId, setActiveClassId } = useAuth()

  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-bg-card border-b border-border">
      <div className="flex items-center gap-2 min-w-0">
        <img src="/classBankLogo.png" alt={t('app.name')} className="h-7 w-auto shrink-0" />
        <span className="font-semibold text-text truncate">{t('app.name')}</span>
      </div>
      <div className="flex items-center gap-2">
        {adminClasses.length > 0 && (
          <select
            value={activeClassId ?? ''}
            onChange={(e) => setActiveClassId(e.target.value || null)}
            className="rounded-btn border border-border bg-white px-2.5 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-600/30 max-w-[140px]"
          >
            {adminClasses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
        <button
          onClick={onSignOut}
          className="flex items-center justify-center size-9 rounded-btn text-secondary hover:bg-bg-elevated hover:text-text transition-colors cursor-pointer"
          title={t('nav.signOut')}
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}

export function AppShell({ role, onSignOut, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg-main">
      <Sidebar role={role} onSignOut={onSignOut} />
      <MobileTopBar onSignOut={onSignOut} />
      <main className="lg:ml-64 p-4 lg:p-8 pb-20 lg:pb-8">
        {children}
      </main>
      <BottomNav role={role} onSignOut={onSignOut} />
    </div>
  )
}
