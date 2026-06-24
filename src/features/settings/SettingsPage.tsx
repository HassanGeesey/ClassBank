import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { PasswordChangePage } from '../auth/PasswordChangePage'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { adminCreateUser } from '../../lib/admin-api'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const [sid, setSid] = useState('')
  const [name, setName] = useState('')
  const [pwd, setPwd] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'so', label: 'Soomaali' },
  ]

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!sid.trim() || !name.trim() || !pwd.trim()) return
    setLoading(true)
    setMsg('')
    const { error } = await adminCreateUser(sid.trim(), name.trim(), pwd.trim(), null, 'admin')
    setMsg(error || t('settings.success'))
    if (!error) { setSid(''); setName(''); setPwd('') }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">{t('settings.title')}</h1>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-text mb-4">{t('settings.language')}</h2>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-secondary mb-1">{t('settings.languageLabel')}</label>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="block w-full rounded-btn border border-border-hover bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-600/30"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-text mb-4">{t('settings.createAdmin')}</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4 max-w-md">
              <Input id="admin-sid" label={t('settings.adminId')} value={sid} onChange={(e) => setSid(e.target.value)} required />
              <Input id="admin-name" label={t('settings.name')} value={name} onChange={(e) => setName(e.target.value)} required />
              <Input id="admin-pwd" label={t('settings.password')} type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
              <Button type="submit" loading={loading}>{t('settings.submit')}</Button>
              {msg && <p className="text-sm text-secondary">{msg}</p>}
            </form>
          </CardContent>
        </Card>
      )}

      <PasswordChangePage />
    </div>
  )
}
