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
