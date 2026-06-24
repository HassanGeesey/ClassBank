-- Create user_role enum
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'student');

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  role       user_role NOT NULL DEFAULT 'student',
  class_id   UUID,  -- FK to classes, added after classes table exists
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookups by student_id
CREATE INDEX idx_profiles_student_id ON profiles(student_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_class_id ON profiles(class_id);
