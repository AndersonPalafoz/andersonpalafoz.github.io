-- Create the support tables required by the external classes API.
-- Additive and idempotent: no existing rows are deleted or modified.

CREATE TABLE IF NOT EXISTS "external_class_attendance" (
  "id" serial PRIMARY KEY NOT NULL,
  "externalClassId" integer NOT NULL,
  "date" varchar(32) NOT NULL,
  "attendanceData" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "external_class_grades" (
  "id" serial PRIMARY KEY NOT NULL,
  "externalClassId" integer NOT NULL,
  "studentId" integer NOT NULL,
  "assessmentTitle" varchar(180) NOT NULL,
  "score" varchar(32) NOT NULL,
  "maxScore" varchar(32) DEFAULT '10.0' NOT NULL,
  "feedback" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "external_class_materials" (
  "id" serial PRIMARY KEY NOT NULL,
  "externalClassId" integer NOT NULL,
  "title" varchar(180) NOT NULL,
  "fileUrl" text NOT NULL,
  "description" text,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF to_regclass('public.external_classes') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'external_class_attendance_externalClassId_external_classes_id_fk'
  ) THEN
    ALTER TABLE "external_class_attendance"
      ADD CONSTRAINT "external_class_attendance_externalClassId_external_classes_id_fk"
      FOREIGN KEY ("externalClassId") REFERENCES "external_classes"("id") ON DELETE CASCADE;
  END IF;

  IF to_regclass('public.external_classes') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'external_class_grades_externalClassId_external_classes_id_fk'
  ) THEN
    ALTER TABLE "external_class_grades"
      ADD CONSTRAINT "external_class_grades_externalClassId_external_classes_id_fk"
      FOREIGN KEY ("externalClassId") REFERENCES "external_classes"("id") ON DELETE CASCADE;
  END IF;

  IF to_regclass('public.external_students') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'external_class_grades_studentId_external_students_id_fk'
  ) THEN
    ALTER TABLE "external_class_grades"
      ADD CONSTRAINT "external_class_grades_studentId_external_students_id_fk"
      FOREIGN KEY ("studentId") REFERENCES "external_students"("id") ON DELETE CASCADE;
  END IF;

  IF to_regclass('public.external_classes') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'external_class_materials_externalClassId_external_classes_id_fk'
  ) THEN
    ALTER TABLE "external_class_materials"
      ADD CONSTRAINT "external_class_materials_externalClassId_external_classes_id_fk"
      FOREIGN KEY ("externalClassId") REFERENCES "external_classes"("id") ON DELETE CASCADE;
  END IF;
END $$;
