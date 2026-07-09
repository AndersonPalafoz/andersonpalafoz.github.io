CREATE TABLE "progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"courseId" integer NOT NULL,
	"enrollmentId" integer,
	"lessonsCompleted" integer DEFAULT 0,
	"totalLessons" integer DEFAULT 0,
	"percentageCompleted" integer DEFAULT 0,
	"status" "progress_status" DEFAULT 'pending',
	"startedAt" timestamp DEFAULT now(),
	"completedAt" timestamp,
	"lastAccessedAt" timestamp DEFAULT now(),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_enrollmentId_enrollments_id_fk" FOREIGN KEY ("enrollmentId") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;