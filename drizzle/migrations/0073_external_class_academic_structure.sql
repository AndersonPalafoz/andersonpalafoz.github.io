ALTER TABLE "external_classes"
  ADD COLUMN IF NOT EXISTS "duration_type" varchar(32) DEFAULT 'semester',
  ADD COLUMN IF NOT EXISTS "duration_value" integer,
  ADD COLUMN IF NOT EXISTS "duration_unit" varchar(24),
  ADD COLUMN IF NOT EXISTS "has_units" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "unit_count" integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "grading_scope" varchar(16) NOT NULL DEFAULT 'course',
  ADD COLUMN IF NOT EXISTS "passing_average" varchar(8) NOT NULL DEFAULT '5',
  ADD COLUMN IF NOT EXISTS "unit_passing_averages" text;
