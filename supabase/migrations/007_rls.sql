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
