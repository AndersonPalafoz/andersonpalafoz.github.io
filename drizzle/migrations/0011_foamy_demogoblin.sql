CREATE TYPE "public"."lesson_progress_approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'listening';--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "lessonProgress" ADD COLUMN "approvalStatus" "lesson_progress_approval_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessonProgress" ADD COLUMN "approvedBy" integer;--> statement-breakpoint
ALTER TABLE "lessonProgress" ADD COLUMN "approvedAt" timestamp;--> statement-breakpoint
ALTER TABLE "lessonProgress" ADD COLUMN "approvalNote" text;--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "lessonId" integer;--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "isPublic" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "courseId" integer;--> statement-breakpoint
ALTER TABLE "userActivityProgress" ADD COLUMN "audioResponseUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "userActivityProgress" ADD COLUMN "teacherFeedback" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "teacherId" integer;--> statement-breakpoint
ALTER TABLE "lessonProgress" ADD CONSTRAINT "lessonProgress_approvedBy_users_id_fk" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_lessonId_lessons_id_fk" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;