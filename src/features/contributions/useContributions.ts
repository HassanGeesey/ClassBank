import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Contribution } from '../../lib/types'

export interface ContributionWithStudent extends Contribution {
  profiles: { student_id: string; name: string }
}

export function useContributions(classId?: string | null) {
  const [contributions, setContributions] = useState<ContributionWithStudent[]>([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    let query = supabase
      .from('contributions')
      .select('*, profiles!contributions_student_id_fkey(student_id, name)')
      .order('date', { ascending: false })
    if (classId) query = query.eq('class_id', classId)
    const { data } = await query
    if (data) setContributions(data as unknown as ContributionWithStudent[])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [classId])

  async function create(studentId: string, amount: number, date: string) {
    const uid = (await supabase.auth.getUser()).data.user?.id
    const { error } = await supabase.from('contributions').insert({
      student_id: studentId,
      class_id: classId,
      amount,
      date,
      recorded_by: uid,
    } as never)
    if (!error) fetch()
    return error?.message ?? null
  }

  async function remove(id: string) {
    const { error } = await supabase.from('contributions').delete().eq('id', id)
    if (!error) fetch()
    return error?.message ?? null
  }

  return { contributions, loading, create, remove, refetch: fetch }
}

export function useContributionTotals(classId?: string | null) {
  const [total, setTotal] = useState(0)
  const [studentTotals, setStudentTotals] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!classId) { setTotal(0); setStudentTotals({}); return }

    supabase
      .from('contributions')
      .select('student_id, amount')
      .eq('class_id', classId)
      .then(({ data }) => {
        if (!data) return
        const t = data.reduce((sum, c) => sum + Number(c.amount), 0)
        setTotal(t)
        const byStudent: Record<string, number> = {}
        data.forEach((c) => {
          byStudent[c.student_id] = (byStudent[c.student_id] || 0) + Number(c.amount)
        })
        setStudentTotals(byStudent)
      })
  }, [classId])

  return { total, studentTotals }
}
