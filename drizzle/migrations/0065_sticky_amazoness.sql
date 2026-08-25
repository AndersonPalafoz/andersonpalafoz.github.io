ALTER TABLE "courses" ADD COLUMN "duration_type" varchar(32) DEFAULT 'semester';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "duration_value" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "duration_unit" varchar(24);--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "duration_type" varchar(32) DEFAULT 'semester';--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "duration_value" integer;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "duration_unit" varchar(24);