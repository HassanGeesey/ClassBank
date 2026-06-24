import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'

export function PasswordChangePage() {
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email ?? '',
      password: currentPassword,
    })

    if (signInError) {
      setError(t('auth.changePassword.incorrect'))
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) setError(updateError.message)
    else setMessage(t('auth.changePassword.success'))
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-text">{t('auth.changePassword.title')}</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="currentPassword"
              label={t('auth.changePassword.currentPassword')}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              id="newPassword"
              label={t('auth.changePassword.newPassword')}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && <p className="text-sm text-error bg-error/10 rounded-btn px-3 py-2 border border-error/20">{error}</p>}
            {message && <p className="text-sm text-success bg-success/10 rounded-btn px-3 py-2 border border-success/20">{message}</p>}
            <Button type="submit" loading={loading}>{t('auth.changePassword.submit')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
