export type UserRole = 'super_admin' | 'admin' | 'student'

export interface Profile {
  id: string
  student_id: string
  name: string
  role: UserRole
  class_id: string | null
  created_at: string
}

export interface Class {
  id: string
  name: string
  contribution_target: number
  created_at: string
}

export interface ClassAdmin {
  id: string
  class_id: string
  admin_id: string
}

export interface Contribution {
  id: string
  student_id: string
  class_id: string
  amount: number
  date: string
  recorded_by: string
  created_at: string
}

export interface Expense {
  id: string
  class_id: string
  description: string
  amount: number
  date: string
  added_by: string
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  timestamp: string
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Json; Update: Json }
      classes: { Row: Class; Insert: Json; Update: Json }
      class_admins: { Row: ClassAdmin; Insert: Json; Update: Json }
      contributions: { Row: Contribution; Insert: Json; Update: Json }
      expenses: { Row: Expense; Insert: Json; Update: Json }
      activity_logs: { Row: ActivityLog; Insert: Json; Update: Json }
    }
  }
}
