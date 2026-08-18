CREATE TABLE "grade_review_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"gradeId" integer NOT NULL,
	"userId" integer NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"professorResponse" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grade_review_requests" ADD CONSTRAINT "grade_review_requests_gradeId_external_class_grades_id_fk" FOREIGN KEY ("gradeId") REFERENCES "public"."external_class_grades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_review_requests" ADD CONSTRAINT "grade_review_requests_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;