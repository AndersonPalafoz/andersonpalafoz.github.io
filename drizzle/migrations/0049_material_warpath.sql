ALTER TABLE "courses" ADD COLUMN "course_type" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "external_redirect_url" varchar(1000);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "sync_modality" varchar(64) DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "deletedAt" timestamp;