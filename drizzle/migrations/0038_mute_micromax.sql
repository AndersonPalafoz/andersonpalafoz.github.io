CREATE TYPE "public"."forum_post_status" AS ENUM('pending', 'approved', 'rejected', 'resolved');--> statement-breakpoint
CREATE TABLE "forum_post_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"authorId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"category" varchar(80) NOT NULL,
	"content" text NOT NULL,
	"audioUrl" varchar(1000),
	"status" "forum_post_status" DEFAULT 'pending' NOT NULL,
	"moderationNote" text,
	"moderatedBy" integer,
	"moderatedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"authorId" integer NOT NULL,
	"content" text NOT NULL,
	"audioUrl" varchar(1000),
	"isResolved" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forum_post_likes" ADD CONSTRAINT "forum_post_likes_postId_forum_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_post_likes" ADD CONSTRAINT "forum_post_likes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_moderatedBy_users_id_fk" FOREIGN KEY ("moderatedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_postId_forum_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "forum_post_likes_post_user_idx" ON "forum_post_likes" USING btree ("postId","userId");