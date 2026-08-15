CREATE TYPE "public"."event_type" AS ENUM('login', 'material_submission', 'activity_complete', 'course_enroll', 'role_change');--> statement-breakpoint
CREATE TYPE "public"."modality" AS ENUM('individual', 'group', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('scheduled', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" integer NOT NULL,
	"studentId" integer NOT NULL,
	"present" boolean DEFAULT true NOT NULL,
	"notes" text,
	"recordedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer,
	"teacherId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"modality" "modality" DEFAULT 'individual' NOT NULL,
	"scheduledAt" timestamp NOT NULL,
	"durationMinutes" integer DEFAULT 60,
	"status" "session_status" DEFAULT 'scheduled' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"userEmail" varchar(320),
	"eventType" "event_type" NOT NULL,
	"details" text,
	"ipAddress" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_sessionId_class_sessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."class_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_users_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_teacherId_users_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;