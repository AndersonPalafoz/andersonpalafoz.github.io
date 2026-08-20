ALTER TABLE "courses" ADD COLUMN "class_days" varchar(255);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "class_time" varchar(100);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "workload_hours" integer DEFAULT 40;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "max_absence_percent" integer DEFAULT 25;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "class_days" varchar(255);--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "class_time" varchar(100);--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "workload_hours" integer DEFAULT 40;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "max_absence_percent" integer DEFAULT 25;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "external_students" ADD COLUMN "socialName" varchar(160);--> statement-breakpoint
ALTER TABLE "external_students" ADD COLUMN "cpf" varchar(20);--> statement-breakpoint
ALTER TABLE "external_students" ADD COLUMN "phone" varchar(32);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "socialName" varchar(160);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cpf" varchar(20);--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "deletedAt";