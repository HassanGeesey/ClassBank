import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../lib/types'
import { AUTH_EMAIL_DOMAIN } from '../../lib/constants'

interface AdminClassInfo {
  id: string
  name: string
}

interface AuthState {
  user: Profile | null
  loading: boolean
  activeClassId: string | null
  adminClassIds: string[]
  adminClasses: AdminClassInfo[]
  setActiveClassId: (id: string | null) => void
  signIn: (studentId: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeClassId, setActiveClassId] = useState<string | null>(null)
  const [adminClassIds, setAdminClassIds] = useState<string[]>([])
  const [adminClasses, setAdminClasses] = useState<AdminClassInfo[]>([])

  async function fetchAdminClasses(profile: Profile) {
    if (profile.role !== 'admin') return
    const { data } = await supabase
      .from('class_admins')
      .select('class_id, classes!class_admins_class_id_fkey(name)')
      .eq('admin_id', profile.id)
    if (data) {
      const mapped = data.map((r: any) => ({ id: r.class_id, name: r.classes?.name ?? 'Unknown' }))
      setAdminClasses(mapped)
      const ids = mapped.map((r) => r.id)
      setAdminClassIds(ids)
      if (ids.length > 0 && !activeClassId) {
        setActiveClassId(ids[0])
      }
    }
  }

  async function fetchProfile(id: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (data) {
      setUser(data)
      await fetchAdminClasses(data)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchProfile(session.user.id)
      else {
        setUser(null)
        setActiveClassId(null)
        setAdminClassIds([])
        setAdminClasses([])
        setLoading(false)
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  async function signIn(studentId: string, password: string): Promise<string | null> {
    const email = `${studentId}@${AUTH_EMAIL_DOMAIN}`
    setLoading(true)
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setLoading(false); return error.message }
    if (data?.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (profile) {
        setUser(profile)
        await fetchAdminClasses(profile)
      }
    }
    setLoading(false)
    return null
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setActiveClassId(null)
    setAdminClassIds([])
    setAdminClasses([])
  }

  return (
    <AuthContext.Provider value={{ user, loading, activeClassId, adminClassIds, adminClasses, setActiveClassId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
