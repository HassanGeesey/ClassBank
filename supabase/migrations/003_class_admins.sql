-- Create class_admins join table
CREATE TABLE class_admins (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id  UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  admin_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(class_id, admin_id)
);

CREATE INDEX idx_class_admins_class_id ON class_admins(class_id);
CREATE INDEX idx_class_admins_admin_id ON class_admins(admin_id);
