import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface ContributionRow {
  id: string
  amount: number
  date: string
}

interface StudentDashboardData {
  personalTotal: number
  classTotal: number
  expenseTotal: number
  remainingBalance: number
  target: number
  status: 'paid' | 'partial' | 'unpaid'
  contributions: ContributionRow[]
}

export function useStudentDashboard(userId?: string | null, classId?: string | null) {
  const [data, setData] = useState<StudentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classId || !userId) { setData(null); setLoading(false); return }
    setLoading(true)

    Promise.all([
      supabase.from('contributions').select('id, amount, date').eq('student_id', userId).eq('class_id', classId).order('date', { ascending: false }),
      supabase.from('contributions').select('amount').eq('class_id', classId),
      supabase.from('expenses').select('amount').eq('class_id', classId),
      supabase.from('classes').select('contribution_target').eq('id', classId).single(),
    ]).then(([myContribRes, allContribRes, expenseRes, classRes]) => {
      const contributions = (myContribRes.data ?? []) as ContributionRow[]
      const allContributions = allContribRes.data ?? []
      const expenses = expenseRes.data ?? []
      const classData = classRes.data as { contribution_target: number } | null

      const personalTotal = contributions.reduce((s, c) => s + Number(c.amount), 0)
      const classTotal = allContributions.reduce((s, c) => s + Number(c.amount), 0)
      const expenseTotal = expenses.reduce((s, e) => s + Number(e.amount), 0)
      const target = classData?.contribution_target ?? 0
      const status = personalTotal >= target ? 'paid' : personalTotal > 0 ? 'partial' : 'unpaid'

      setData({ personalTotal, classTotal, expenseTotal, remainingBalance: classTotal - expenseTotal, target, status, contributions })
      setLoading(false)
    })
  }, [userId, classId])

  return { data, loading }
}
