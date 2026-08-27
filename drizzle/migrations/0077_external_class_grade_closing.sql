ALTER TABLE "external_classes"
  ADD COLUMN IF NOT EXISTS "grade_status" varchar(16) DEFAULT 'open' NOT NULL;

ALTER TABLE "external_classes"
  ADD COLUMN IF NOT EXISTS "grades_closed_at" timestamp;

ALTER TABLE "external_classes"
  ADD COLUMN IF NOT EXISTS "grades_closed_by" integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'external_classes_grades_closed_by_users_id_fk'
  ) THEN
    ALTER TABLE "external_classes"
      ADD CONSTRAINT "external_classes_grades_closed_by_users_id_fk"
      FOREIGN KEY ("grades_closed_by") REFERENCES "users"("id")
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "external_classes_grade_status_idx"
  ON "external_classes" ("grade_status");

-- Fechamento de notas é aberto por padrão para preservar todos os fluxos existentes.
