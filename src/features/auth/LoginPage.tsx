import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { t } = useTranslation()
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await signIn(studentId, password)
    if (err) setError(err)
    else navigate('/dashboard', { replace: true })
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-main p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex flex-col items-center gap-3 mb-2">
            <img src="/classBankLogo.png" alt={t('app.name')} className="h-12 w-auto" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-text">{t('auth.signIn.title')}</h1>
              <p className="text-sm text-muted mt-0.5">{t('auth.signIn.subtitle')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="studentId"
              label={t('auth.signIn.studentId')}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder={t('auth.signIn.studentIdPlaceholder')}
              required
            />
            <Input
              id="password"
              label={t('auth.signIn.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.signIn.passwordPlaceholder')}
              required
            />
            {error && (
              <p className="text-sm text-error bg-error/10 rounded-btn px-3 py-2 border border-error/20">{error}</p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              {t('auth.signIn.signIn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
