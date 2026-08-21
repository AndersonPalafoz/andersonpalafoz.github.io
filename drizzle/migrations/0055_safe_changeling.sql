ALTER TABLE "external_classes" ADD COLUMN "level" varchar(50) DEFAULT 'Básico (A1-A2)';--> statement-breakpoint
ALTER TABLE "course_purchases" DROP COLUMN "amountTotal";--> statement-breakpoint
ALTER TABLE "course_purchases" DROP COLUMN "currency";