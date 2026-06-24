import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { Card, CardContent } from '../../components/ui/Card'
import { Table, TBody, Td, Th, THead } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { useDashboard } from './useDashboard'
import { formatCurrency } from '../../lib/utils'
import { PiggyBank, Receipt, Users, Loader2, TrendingDown, TrendingUp, Shield } from 'lucide-react'
import type { Profile } from '../../lib/types'

export function DashboardPage() {
  const { user, activeClassId } = useAuth()
  const classId = activeClassId
  const { data, loading } = useDashboard(classId)
  const [admins, setAdmins] = useState<Profile[]>([])
  const [adminClasses, setAdminClasses] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (user?.role !== 'super_admin') return
    supabase.from('profiles').select('*').eq('role', 'admin').order('name').then(({ data }) => {
      if (data) setAdmins(data)
    })
  }, [user?.role])

  useEffect(() => {
    if (admins.length === 0) return
    const ids = admins.map((a) => a.id)
    supabase
      .from('class_admins')
      .select('admin_id, classes!class_admins_class_id_fkey(name)')
      .in('admin_id', ids)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string[]> = {}
        for (const r of data as any[]) {
          if (!map[r.admin_id]) map[r.admin_id] = []
          map[r.admin_id].push(r.classes?.name || 'Unknown')
        }
        setAdminClasses(map)
      })
  }, [admins])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        {user?.role === 'super_admin' ? (
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-brand-600" />
                <h2 className="text-lg font-semibold text-text">All Admins</h2>
              </div>
              {admins.length === 0 ? (
                <p className="text-sm text-muted">No admins yet</p>
              ) : (
                <Table>
                  <THead>
                    <tr>
                      <Th>Admin ID</Th>
                      <Th>Name</Th>
                      <Th>Assigned Classes</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {admins.map((a) => (
                      <tr key={a.id}>
                        <Td className="font-mono text-sm text-muted">{a.student_id}</Td>
                        <Td className="font-medium text-text">{a.name}</Td>
                        <Td className="text-secondary">{(adminClasses[a.id] ?? ['—']).join(', ')}</Td>
                      </tr>
                    ))}
                  </TBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted">
              No class assigned
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const isPositive = data.remainingBalance >= 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-secondary">Welcome back, {user?.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-success/10 p-3">
              <PiggyBank size={24} className="text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Contributions</p>
              <p className="text-2xl font-bold text-text tabular-nums">{formatCurrency(data.totalContributions)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-error/10 p-3">
              <Receipt size={24} className="text-error" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Expenses</p>
              <p className="text-2xl font-bold text-text tabular-nums">{formatCurrency(data.totalExpenses)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className={`rounded-lg p-3 ${isPositive ? 'bg-info/10' : 'bg-error/10'}`}>
              {isPositive ? (
                <TrendingUp size={24} className="text-info" />
              ) : (
                <TrendingDown size={24} className="text-error" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted">Remaining Balance</p>
              <p className={`text-2xl font-bold tabular-nums ${isPositive ? 'text-text' : 'text-error'}`}>
                {formatCurrency(data.remainingBalance)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-warning/10 p-3">
              <Users size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Students</p>
              <p className="text-2xl font-bold text-text tabular-nums">{data.totalStudents}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-5">
          <h2 className="text-sm font-semibold text-secondary mb-3">Payment Status</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="success">Paid</Badge>
              <span className="text-sm text-text">{data.paidCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">Partial</Badge>
              <span className="text-sm text-text">{data.partialCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="danger">Unpaid</Badge>
              <span className="text-sm text-text">{data.unpaidCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
