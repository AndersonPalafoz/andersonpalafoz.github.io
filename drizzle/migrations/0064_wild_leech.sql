ALTER TABLE "external_class_grades" ADD COLUMN IF NOT EXISTS "assessmentType" varchar(32) DEFAULT 'custom' NOT NULL;--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD COLUMN IF NOT EXISTS "assessmentVersion" varchar(16);--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD COLUMN IF NOT EXISTS "assessmentComponent" varchar(64);--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD COLUMN IF NOT EXISTS "rubricScores" text;--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD COLUMN IF NOT EXISTS "assessmentDate" varchar(32);
