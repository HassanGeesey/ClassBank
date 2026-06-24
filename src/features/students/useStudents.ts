import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { adminCreateUser, adminDeleteUser } from '../../lib/admin-api'
import type { Profile } from '../../lib/types'

export function useStudents(classId?: string | null) {
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function fetch() {
    setLoading(true)
    let query = supabase.from('profiles').select('*').eq('role', 'student').order('name')
    if (classId) query = query.eq('class_id', classId)
    const { data } = await query
    if (data) setStudents(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [classId])

  async function create(studentId: string, name: string, password: string, passwordClassId?: string) {
    const { error } = await adminCreateUser(studentId, name, password, passwordClassId ?? classId ?? null)
    if (error) return error
    fetch()
    return null
  }

  async function updateProfile(id: string, updates: Record<string, unknown>) {
    const { error } = await supabase.from('profiles').update(updates as never).eq('id', id)
    if (!error) fetch()
    return error?.message ?? null
  }

  async function remove(id: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (!error) {
      await adminDeleteUser(id)
      fetch()
    }
    return error?.message ?? null
  }

  async function importCSV(lines: string[][]) {
    const errors: string[] = []
    for (let i = 0; i < lines.length; i++) {
      const [sid, name, password] = lines[i]
      if (!sid || !name || !password) {
        errors.push(`Row ${i + 1}: missing fields`)
        continue
      }
      const err = await create(sid.trim(), name.trim(), password.trim())
      if (err) errors.push(`Row ${i + 1} (${sid}): ${err}`)
    }
    return errors
  }

  const filtered = students.filter(
    (s) =>
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()),
  )

  return { students: filtered, allStudents: students, loading, search, setSearch, create, update: updateProfile, remove, importCSV, refetch: fetch }
}
