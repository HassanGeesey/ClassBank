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
-- Create classes table
CREATE TABLE classes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  contribution_target NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from profiles to classes
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_class
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;
-- Create class_admins join table
CREATE TABLE class_admins (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id  UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  admin_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(class_id, admin_id)
);

CREATE INDEX idx_class_admins_class_id ON class_admins(class_id);
CREATE INDEX idx_class_admins_admin_id ON class_admins(admin_id);
-- Create contributions table
CREATE TABLE contributions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contributions_student_id ON contributions(student_id);
CREATE INDEX idx_contributions_class_id ON contributions(class_id);
CREATE INDEX idx_contributions_date ON contributions(date);
-- Create expenses table
CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by    UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_class_id ON expenses(class_id);
CREATE INDEX idx_expenses_date ON expenses(date);
-- Create activity_logs table (optional audit trail)
CREATE TABLE activity_logs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action    TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
-- SECURITY DEFINER to bypass RLS (prevents infinite recursion)
CREATE OR REPLACE FUNCTION user_role()
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Helper function: get current user's class_id
-- SECURITY DEFINER to bypass RLS (prevents infinite recursion)
CREATE OR REPLACE FUNCTION user_class_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT class_id FROM profiles WHERE id = auth.uid()
$$;

-- ========== PROFILES ==========

CREATE POLICY "super_admin_all_profiles"
  ON profiles FOR ALL
  USING (user_role() = 'super_admin');

CREATE POLICY "admin_read_assigned_students"
  ON profiles FOR SELECT
  USING (
    user_role() = 'admin'
    AND (
      profiles.class_id IN (
        SELECT class_id FROM class_admins WHERE admin_id = auth.uid()
      )
      OR profiles.id = auth.uid()
    )
  );

CREATE POLICY "student_read_own"
  ON profiles FOR SELECT
  USING (user_role() = 'student' AND profiles.id = auth.uid());

-- ========== CLASSES ==========

CREATE POLICY "super_admin_all_classes"
  ON classes FOR ALL
  USING (user_role() = 'super_admin');

CREATE POLICY "admin_read_assigned_classes"
  ON classes FOR SELECT
  USING (
    user_role() = 'admin'
    AND classes.id IN (
      SELECT class_id FROM class_admins WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "student_read_own_class"
  ON classes FOR SELECT
  USING (
    user_role() = 'student'
    AND classes.id = user_class_id()
  );

-- ========== CLASS ADMINS ==========

CREATE POLICY "super_admin_all_class_admins"
  ON class_admins FOR ALL
  USING (user_role() = 'super_admin');

CREATE POLICY "admin_read_own_class_admins"
  ON class_admins FOR SELECT
  USING (admin_id = auth.uid());

-- ========== CONTRIBUTIONS ==========

CREATE POLICY "super_admin_all_contributions"
  ON contributions FOR ALL
  USING (user_role() = 'super_admin');

CREATE POLICY "admin_manage_class_contributions"
  ON contributions FOR ALL
  USING (
    user_role() = 'admin'
    AND contributions.class_id IN (
      SELECT class_id FROM class_admins WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "student_read_own_contributions"
  ON contributions FOR SELECT
  USING (
    user_role() = 'student'
    AND contributions.student_id = auth.uid()
  );

-- ========== EXPENSES ==========

CREATE POLICY "super_admin_all_expenses"
  ON expenses FOR ALL
  USING (user_role() = 'super_admin');

CREATE POLICY "admin_manage_class_expenses"
  ON expenses FOR ALL
  USING (
    user_role() = 'admin'
    AND expenses.class_id IN (
      SELECT class_id FROM class_admins WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "student_read_class_expenses"
  ON expenses FOR SELECT
  USING (
    user_role() = 'student'
    AND expenses.class_id = user_class_id()
  );

-- ========== ACTIVITY LOGS ==========

CREATE POLICY "super_admin_all_logs"
  ON activity_logs FOR ALL
  USING (user_role() = 'super_admin');

CREATE POLICY "admin_read_own_logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());
-- Compute student payment status
-- Returns: student_id, status (paid/partial/unpaid), total_contributed
CREATE OR REPLACE FUNCTION get_student_payment_status(p_class_id UUID)
RETURNS TABLE (
  student_id UUID,
  status TEXT,
  total NUMERIC
)
LANGUAGE SQL
STABLE
AS $$
  WITH class_target AS (
    SELECT contribution_target FROM classes WHERE id = p_class_id
  ),
  student_totals AS (
    SELECT
      p.id AS student_id,
      COALESCE(SUM(c.amount), 0) AS total
    FROM profiles p
    LEFT JOIN contributions c ON c.student_id = p.id
    WHERE p.class_id = p_class_id AND p.role = 'student'
    GROUP BY p.id
  )
  SELECT
    st.student_id,
    CASE
      WHEN st.total >= ct.contribution_target THEN 'paid'
      WHEN st.total > 0 THEN 'partial'
      ELSE 'unpaid'
    END::TEXT AS status,
    st.total
  FROM student_totals st
  CROSS JOIN class_target ct;
$$;
