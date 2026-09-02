CREATE TABLE "google_classroom_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseworkId" integer NOT NULL,
	"classroomSubmissionId" varchar(255) NOT NULL,
	"studentGoogleUserId" varchar(255) NOT NULL,
	"localUserId" integer,
	"state" varchar(32) DEFAULT 'NEW' NOT NULL,
	"late" boolean DEFAULT false NOT NULL,
	"draftGrade" numeric(10, 2),
	"assignedGrade" numeric(10, 2),
	"alternateLink" text,
	"creationTime" timestamp,
	"updateTime" timestamp,
	"submissionHistory" jsonb,
	"lastSyncedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "google_classroom_submissions" ADD CONSTRAINT "google_classroom_submissions_courseworkId_google_classroom_coursework_id_fk" FOREIGN KEY ("courseworkId") REFERENCES "public"."google_classroom_coursework"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_classroom_submissions" ADD CONSTRAINT "google_classroom_submissions_localUserId_users_id_fk" FOREIGN KEY ("localUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "google_classroom_submissions_external_idx" ON "google_classroom_submissions" USING btree ("courseworkId","classroomSubmissionId");