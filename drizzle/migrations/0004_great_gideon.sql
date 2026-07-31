ALTER TABLE "enrollments" ALTER COLUMN "progress" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "currentModule" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "materials" ALTER COLUMN "downloads" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(32);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" varchar(120);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;