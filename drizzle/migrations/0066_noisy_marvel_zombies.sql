ALTER TABLE "courses" ADD COLUMN "has_units" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "unit_count" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "grading_scope" varchar(16) DEFAULT 'course' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "passing_average" varchar(8) DEFAULT '5' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "unit_passing_averages" text;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "has_units" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "unit_count" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "grading_scope" varchar(16) DEFAULT 'course' NOT NULL;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "passing_average" varchar(8) DEFAULT '5' NOT NULL;--> statement-breakpoint
ALTER TABLE "external_classes" ADD COLUMN "unit_passing_averages" text;