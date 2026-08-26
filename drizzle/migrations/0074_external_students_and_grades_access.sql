ALTER TABLE "external_students"
  ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "external_class_grades"
  ADD COLUMN IF NOT EXISTS "unit_number" integer;
