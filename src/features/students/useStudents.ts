import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { AUTH_EMAIL_DOMAIN } from '../../lib/constants'
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
    const email = `${studentId}@${AUTH_EMAIL_DOMAIN}`
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) return authError.message
    if (!authData.user) return 'Failed to create user'

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      student_id: studentId,
      name,
      role: 'student',
      class_id: passwordClassId ?? classId ?? null,
    } as never)
    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return profileError.message
    }
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
      await supabase.auth.admin.deleteUser(id)
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
