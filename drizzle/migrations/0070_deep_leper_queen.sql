ALTER TABLE "article_comments" ADD COLUMN "moderation_status" varchar(20) DEFAULT 'visible' NOT NULL;--> statement-breakpoint
ALTER TABLE "article_comments" ADD COLUMN "moderated_at" timestamp;--> statement-breakpoint
ALTER TABLE "article_comments" ADD COLUMN "moderated_by" integer;--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;