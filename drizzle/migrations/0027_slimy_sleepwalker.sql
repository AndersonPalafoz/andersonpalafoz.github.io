ALTER TABLE "site_content_blocks" ADD COLUMN "status" varchar(32) DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_content_blocks" ADD COLUMN "contentType" varchar(32) DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_content_blocks" ADD COLUMN "orderIndex" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "site_content_blocks" ADD COLUMN "tag" varchar(64) DEFAULT 'Geral' NOT NULL;