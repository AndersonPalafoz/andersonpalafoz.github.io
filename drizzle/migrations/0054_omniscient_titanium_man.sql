ALTER TABLE "course_purchases" ADD COLUMN "amountTotal" integer;--> statement-breakpoint
ALTER TABLE "course_purchases" ADD COLUMN "currency" varchar(8) DEFAULT 'brl';
