CREATE TABLE "google_classroom_coursework" (
	"id" serial PRIMARY KEY NOT NULL,
	"classroomCourseId" integer NOT NULL,
	"classroomCourseworkId" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"workType" varchar(32),
	"state" varchar(32) DEFAULT 'PUBLISHED' NOT NULL,
	"dueDate" timestamp,
	"maxPoints" numeric(10, 2),
	"topicId" varchar(255),
	"alternateLink" text,
	"materials" jsonb,
	"lastSyncedAt" timestamp,
	"archivedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "google_classroom_coursework" ADD CONSTRAINT "google_classroom_coursework_classroomCourseId_google_classroom_courses_id_fk" FOREIGN KEY ("classroomCourseId") REFERENCES "public"."google_classroom_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "google_classroom_coursework_external_idx" ON "google_classroom_coursework" USING btree ("classroomCourseId","classroomCourseworkId");