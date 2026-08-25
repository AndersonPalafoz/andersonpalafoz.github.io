ALTER TABLE "external_class_grades" ADD COLUMN "assessmentType" varchar(32) DEFAULT 'custom' NOT NULL;--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD COLUMN "assessmentVersion" varchar(16);--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD COLUMN "assessmentComponent" varchar(64);--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD COLUMN "rubricScores" text;--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD COLUMN "assessmentDate" varchar(32);