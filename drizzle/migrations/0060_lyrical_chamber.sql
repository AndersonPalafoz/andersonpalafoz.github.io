CREATE TABLE "article_comment_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"commentId" integer NOT NULL,
	"authorId" integer NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_comment_replies" ADD CONSTRAINT "article_comment_replies_commentId_article_comments_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."article_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_comment_replies" ADD CONSTRAINT "article_comment_replies_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;