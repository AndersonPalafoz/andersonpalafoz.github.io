CREATE TABLE "article_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"articleId" integer NOT NULL,
	"userName" varchar(160) NOT NULL,
	"userEmail" varchar(320),
	"rating" integer DEFAULT 5 NOT NULL,
	"comment" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_articleId_articles_id_fk" FOREIGN KEY ("articleId") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;