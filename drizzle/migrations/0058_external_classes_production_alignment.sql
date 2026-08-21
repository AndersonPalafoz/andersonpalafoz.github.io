-- Align external class tables with the current Drizzle schema.
-- Additive and idempotent: no existing rows are deleted or modified.

CREATE TABLE IF NOT EXISTS "external_classes" (
  "id" serial PRIMARY KEY NOT NULL,
  "institution" varchar(120) NOT NULL,
  "className" varchar(180) NOT NULL,
  "courseName" varchar(180) NOT NULL,
  "academicTerm" varchar(50) NOT NULL,
  "teacherId" integer NOT NULL,
  "description" text,
  "class_days" varchar(255),
  "class_time" varchar(100),
  "workload_hours" integer DEFAULT 40,
  "start_date" timestamp,
  "end_date" timestamp,
  "max_absence_percent" integer DEFAULT 25,
  "modality" varchar(32) DEFAULT 'Remota',
  "meeting_link" varchar(500),
  "classroom_location" varchar(255),
  "level" varchar(50) DEFAULT 'Básico (A1-A2)',
  "instructor_name" varchar(180),
  "monitors" varchar(500),
  "deleted_at" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "external_classes"
  ADD COLUMN IF NOT EXISTS "class_days" varchar(255),
  ADD COLUMN IF NOT EXISTS "class_time" varchar(100),
  ADD COLUMN IF NOT EXISTS "workload_hours" integer DEFAULT 40,
  ADD COLUMN IF NOT EXISTS "start_date" timestamp,
  ADD COLUMN IF NOT EXISTS "end_date" timestamp,
  ADD COLUMN IF NOT EXISTS "max_absence_percent" integer DEFAULT 25,
  ADD COLUMN IF NOT EXISTS "modality" varchar(32) DEFAULT 'Remota',
  ADD COLUMN IF NOT EXISTS "meeting_link" varchar(500),
  ADD COLUMN IF NOT EXISTS "classroom_location" varchar(255),
  ADD COLUMN IF NOT EXISTS "level" varchar(50) DEFAULT 'Básico (A1-A2)',
  ADD COLUMN IF NOT EXISTS "instructor_name" varchar(180),
  ADD COLUMN IF NOT EXISTS "monitors" varchar(500),
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

CREATE TABLE IF NOT EXISTS "external_students" (
  "id" serial PRIMARY KEY NOT NULL,
  "externalClassId" integer NOT NULL,
  "name" varchar(180) NOT NULL,
  "socialName" varchar(160),
  "cpf" varchar(20),
  "email" varchar(320),
  "phone" varchar(32),
  "studentIdNumber" varchar(64),
  "category" varchar(100),
  "university" varchar(120),
  "component" varchar(100),
  "status" varchar(32) DEFAULT 'active' NOT NULL,
  "notes" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "external_students"
  ADD COLUMN IF NOT EXISTS "socialName" varchar(160),
  ADD COLUMN IF NOT EXISTS "cpf" varchar(20),
  ADD COLUMN IF NOT EXISTS "phone" varchar(32),
  ADD COLUMN IF NOT EXISTS "category" varchar(100),
  ADD COLUMN IF NOT EXISTS "university" varchar(120),
  ADD COLUMN IF NOT EXISTS "component" varchar(100);

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
  IF to_regclass('public.users') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'external_classes_teacherId_users_id_fk'
  ) THEN
    ALTER TABLE "external_classes"
      ADD CONSTRAINT "external_classes_teacherId_users_id_fk"
      FOREIGN KEY ("teacherId") REFERENCES "users"("id");
  END IF;

  IF to_regclass('public.external_classes') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'external_students_externalClassId_external_classes_id_fk'
  ) THEN
    ALTER TABLE "external_students"
      ADD CONSTRAINT "external_students_externalClassId_external_classes_id_fk"
      FOREIGN KEY ("externalClassId") REFERENCES "external_classes"("id") ON DELETE CASCADE;
  END IF;

  IF to_regclass('public.external_classes') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'external_class_attendance_externalClassId_external_classes_id_fk'
  ) THEN
    ALTER TABLE "external_class_attendance"
      ADD CONSTRAINT "external_class_attendance_externalClassId_external_classes_id_fk"
      FOREIGN KEY ("externalClassId") REFERENCES "external_classes"("id") ON DELETE CASCADE;
  END IF;

  IF to_regclass('public.external_classes') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'external_class_materials_externalClassId_external_classes_id_fk'
  ) THEN
    ALTER TABLE "external_class_materials"
      ADD CONSTRAINT "external_class_materials_externalClassId_external_classes_id_fk"
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
END $$;
