CREATE TABLE "site_content_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"blockId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(32) DEFAULT 'published' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site_content_revisions" ADD CONSTRAINT "site_content_revisions_blockId_site_content_blocks_id_fk" FOREIGN KEY ("blockId") REFERENCES "public"."site_content_blocks"("id") ON DELETE cascade ON UPDATE no action;