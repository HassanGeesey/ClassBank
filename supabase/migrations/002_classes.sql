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
