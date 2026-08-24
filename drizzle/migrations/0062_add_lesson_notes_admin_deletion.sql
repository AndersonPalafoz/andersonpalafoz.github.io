ALTER TABLE "lesson_notes" ADD COLUMN "deletedByAdminAt" timestamp;--> statement-breakpoint
ALTER TABLE "lesson_notes" ADD COLUMN "deletedByAdminEmail" text;
