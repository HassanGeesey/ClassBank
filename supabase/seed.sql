-- Seed: Create a super admin account
-- Note: The auth.users entry must be created via Supabase Auth UI or API
-- This assumes the auth user already exists with matching UUID

-- Example: Super admin profile
-- INSERT INTO profiles (id, student_id, name, role, class_id)
-- VALUES ('<AUTH_USER_UUID>', 'admin-001', 'System Admin', 'super_admin', NULL);

-- Example: A class
-- INSERT INTO classes (id, name) VALUES (gen_random_uuid(), 'BSIT 3A');

-- Example: Admin profile for that class
-- INSERT INTO profiles (id, student_id, name, role, class_id)
-- VALUES ('<AUTH_USER_UUID>', 'admin-002', 'Class Admin', 'admin', '<CLASS_UUID>');

-- INSERT INTO class_admins (class_id, admin_id)
-- VALUES ('<CLASS_UUID>', '<ADMIN_PROFILE_UUID>');
