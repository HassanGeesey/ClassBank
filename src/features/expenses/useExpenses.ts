import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Expense } from '../../lib/types'

export function useExpenses(classId?: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    let query = supabase.from('expenses').select('*').order('date', { ascending: false })
    if (classId) query = query.eq('class_id', classId)
    const { data } = await query
    if (data) setExpenses(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [classId])

  async function create(description: string, amount: number, date: string) {
    const uid = (await supabase.auth.getUser()).data.user?.id
    const { error } = await supabase.from('expenses').insert({
      class_id: classId,
      description,
      amount,
      date,
      added_by: uid,
    } as never)
    if (!error) fetch()
    return error?.message ?? null
  }

  async function remove(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (!error) fetch()
    return error?.message ?? null
  }

  return { expenses, loading, create, remove, refetch: fetch }
}

export function useExpenseTotal(classId?: string | null) {
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!classId) { setTotal(0); return }
    supabase
      .from('expenses')
      .select('amount')
      .eq('class_id', classId)
      .then(({ data }) => {
        if (data) setTotal(data.reduce((sum, e) => sum + Number(e.amount), 0))
      })
  }, [classId])

  return { total }
}
