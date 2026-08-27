ALTER TABLE "external_students" ADD COLUMN IF NOT EXISTS "manual_average" varchar(32);
--> statement-breakpoint
ALTER TABLE "external_students" ADD COLUMN IF NOT EXISTS "manual_average_reason" text;
--> statement-breakpoint
ALTER TABLE "external_students" ADD COLUMN IF NOT EXISTS "manual_average_updated_at" timestamp;
--> statement-breakpoint
ALTER TABLE "external_students" ADD COLUMN IF NOT EXISTS "manual_average_updated_by" integer;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "external_students" ADD CONSTRAINT "external_students_manual_average_updated_by_users_id_fk" FOREIGN KEY ("manual_average_updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
