import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Class, Profile } from '../../lib/types'

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data } = await supabase.from('classes').select('*').order('name')
    if (data) setClasses(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  async function create(name: string, contribution_target = 0) {
    const { error } = await supabase.from('classes').insert({ name, contribution_target } as never)
    if (!error) fetch()
    return error?.message ?? null
  }

  async function update(id: string, name: string, contribution_target = 0) {
    const { error } = await supabase.from('classes').update({ name, contribution_target } as never).eq('id', id)
    if (!error) fetch()
    return error?.message ?? null
  }

  async function remove(id: string) {
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (!error) fetch()
    return error?.message ?? null
  }

  return { classes, loading, create, update, remove, refetch: fetch }
}

export function useClassAdmins(classId: string | null) {
  const [admins, setAdmins] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!classId) { setAdmins([]); return }
    setLoading(true)
    supabase
      .from('class_admins')
      .select('admin_id, profiles!class_admins_admin_id_fkey(*)')
      .eq('class_id', classId)
      .then(({ data }) => {
        if (data) setAdmins(data.map((r: any) => r.profiles as Profile))
        setLoading(false)
      })
  }, [classId])

  return { admins, loading }
}

export function useAssignableAdmins(excludeIds: string[]) {
  const [admins, setAdmins] = useState<Profile[]>([])

  useEffect(() => {
    let query = supabase.from('profiles').select('*').eq('role', 'admin')
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`)
    }
    query.order('name').then(({ data }) => {
      if (data) setAdmins(data)
    })
  }, [excludeIds.join(',')])

  return { admins }
}
