import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface DashboardData {
  totalContributions: number
  totalExpenses: number
  remainingBalance: number
  totalStudents: number
  paidCount: number
  partialCount: number
  unpaidCount: number
}

export function useDashboard(classId?: string | null) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classId) { setData(null); setLoading(false); return }
    setLoading(true)

    Promise.all([
      supabase.from('contributions').select('amount').eq('class_id', classId),
      supabase.from('expenses').select('amount').eq('class_id', classId),
      supabase.from('profiles').select('id').eq('class_id', classId).eq('role', 'student'),
      supabase.rpc('get_student_payment_status', { p_class_id: classId }),
    ]).then(([contribRes, expenseRes, studentRes, statusRes]) => {
      const contributions = contribRes.data ?? []
      const expenses = expenseRes.data ?? []
      const students = studentRes.data ?? []

      const totalContributions = contributions.reduce((s, c) => s + Number(c.amount), 0)
      const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
      const studentStatuses = (statusRes.data ?? []) as { student_id: string; status: string; total: number }[]

      const paidCount = studentStatuses.filter((s) => s.status === 'paid').length
      const partialCount = studentStatuses.filter((s) => s.status === 'partial').length
      const unpaidCount = studentStatuses.filter((s) => s.status === 'unpaid').length

      setData({
        totalContributions,
        totalExpenses,
        remainingBalance: totalContributions - totalExpenses,
        totalStudents: students.length,
        paidCount,
        partialCount,
        unpaidCount,
      })
      setLoading(false)
    })
  }, [classId])

  return { data, loading }
}
