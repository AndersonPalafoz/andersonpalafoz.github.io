CREATE TABLE "google_classroom_rosters" (
	"id" serial PRIMARY KEY NOT NULL,
	"classroomCourseId" integer NOT NULL,
	"studentGoogleUserId" varchar(255) NOT NULL,
	"googleEmail" varchar(320),
	"studentName" varchar(255),
	"localUserId" integer,
	"state" varchar(32) DEFAULT 'ACTIVE' NOT NULL,
	"lastSyncedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "google_classroom_rosters" ADD CONSTRAINT "google_classroom_rosters_classroomCourseId_google_classroom_courses_id_fk" FOREIGN KEY ("classroomCourseId") REFERENCES "public"."google_classroom_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_classroom_rosters" ADD CONSTRAINT "google_classroom_rosters_localUserId_users_id_fk" FOREIGN KEY ("localUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "google_classroom_rosters_external_idx" ON "google_classroom_rosters" USING btree ("classroomCourseId","studentGoogleUserId");