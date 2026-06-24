import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { PasswordChangePage } from '../auth/PasswordChangePage'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { adminCreateUser } from '../../lib/admin-api'

export function SettingsPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const [sid, setSid] = useState('')
  const [name, setName] = useState('')
  const [pwd, setPwd] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!sid.trim() || !name.trim() || !pwd.trim()) return
    setLoading(true)
    setMsg('')
    const { error } = await adminCreateUser(sid.trim(), name.trim(), pwd.trim(), null, 'admin')
    setMsg(error || 'Admin created successfully')
    if (!error) { setSid(''); setName(''); setPwd('') }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Settings</h1>

      {isSuperAdmin && (
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-text mb-4">Create Admin</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4 max-w-md">
              <Input id="admin-sid" label="Admin ID" value={sid} onChange={(e) => setSid(e.target.value)} required />
              <Input id="admin-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input id="admin-pwd" label="Password" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
              <Button type="submit" loading={loading}>Create Admin</Button>
              {msg && <p className="text-sm text-secondary">{msg}</p>}
            </form>
          </CardContent>
        </Card>
      )}

      <PasswordChangePage />
    </div>
  )
}
