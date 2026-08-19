-- Production schema reconciliation for the current Drizzle schema.
-- Additive and idempotent: no existing rows are deleted or modified.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_progress_approval_status') THEN
    CREATE TYPE "public"."lesson_progress_approval_status" AS ENUM ('pending', 'approved', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
    CREATE TYPE "public"."attendance_status" AS ENUM ('present', 'absent', 'justified');
  END IF;
END $$;

ALTER TABLE "public"."lessonProgress"
  ADD COLUMN IF NOT EXISTS "approvalStatus" "public"."lesson_progress_approval_status" NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "approvedBy" integer,
  ADD COLUMN IF NOT EXISTS "approvedAt" timestamp,
  ADD COLUMN IF NOT EXISTS "approvalNote" text;

ALTER TABLE "public"."attendances"
  ADD COLUMN IF NOT EXISTS "status" "public"."attendance_status" NOT NULL DEFAULT 'present';

CREATE TABLE IF NOT EXISTS "public"."external_class_attendance" (
  "id" serial PRIMARY KEY NOT NULL,
  "externalClassId" integer NOT NULL,
  "date" varchar(32) NOT NULL,
  "attendanceData" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."external_class_materials" (
  "id" serial PRIMARY KEY NOT NULL,
  "externalClassId" integer NOT NULL,
  "title" varchar(180) NOT NULL,
  "fileUrl" text NOT NULL,
  "description" text,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."media_assets" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "type" varchar(64) NOT NULL,
  "url" text NOT NULL,
  "fileKey" varchar(500) NOT NULL,
  "size" varchar(64) NOT NULL,
  "tag" varchar(64) DEFAULT 'Geral' NOT NULL,
  "uploaderId" integer,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(160) NOT NULL,
  "email" varchar(320) NOT NULL,
  "subject" varchar(160) NOT NULL,
  "message" text NOT NULL,
  "is_read" boolean DEFAULT false NOT NULL,
  "readAt" timestamp,
  "deletedAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lessonProgress_approvedBy_users_id_fk') THEN
    ALTER TABLE "public"."lessonProgress"
      ADD CONSTRAINT "lessonProgress_approvedBy_users_id_fk"
      FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'external_class_attendance_externalClassId_external_classes_id_fk') THEN
    ALTER TABLE "public"."external_class_attendance"
      ADD CONSTRAINT "external_class_attendance_externalClassId_external_classes_id_fk"
      FOREIGN KEY ("externalClassId") REFERENCES "public"."external_classes"("id") ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'external_class_materials_externalClassId_external_classes_id_fk') THEN
    ALTER TABLE "public"."external_class_materials"
      ADD CONSTRAINT "external_class_materials_externalClassId_external_classes_id_fk"
      FOREIGN KEY ("externalClassId") REFERENCES "public"."external_classes"("id") ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_assets_uploaderId_users_id_fk') THEN
    ALTER TABLE "public"."media_assets"
      ADD CONSTRAINT "media_assets_uploaderId_users_id_fk"
      FOREIGN KEY ("uploaderId") REFERENCES "public"."users"("id");
  END IF;
END $$;
