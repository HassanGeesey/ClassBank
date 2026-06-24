import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../lib/types'
import { AUTH_EMAIL_DOMAIN } from '../../lib/constants'

interface AuthState {
  user: Profile | null
  loading: boolean
  signIn: (studentId: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchProfile(session.user.id)
      else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  async function fetchProfile(id: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    setUser(data)
    setLoading(false)
  }

  async function signIn(studentId: string, password: string): Promise<string | null> {
    const email = `${studentId}@${AUTH_EMAIL_DOMAIN}`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
