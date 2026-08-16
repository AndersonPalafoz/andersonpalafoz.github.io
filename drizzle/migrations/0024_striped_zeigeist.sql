CREATE TABLE "course_review_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"reviewId" integer NOT NULL,
	"authorId" integer NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_review_replies" ADD CONSTRAINT "course_review_replies_reviewId_course_reviews_id_fk" FOREIGN KEY ("reviewId") REFERENCES "public"."course_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_review_replies" ADD CONSTRAINT "course_review_replies_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;