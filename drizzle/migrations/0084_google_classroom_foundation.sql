CREATE TABLE "google_classroom_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"googleAccountId" varchar(255) NOT NULL,
	"googleEmail" varchar(320) NOT NULL,
	"accessTokenEncrypted" text,
	"refreshTokenEncrypted" text,
	"tokenExpiresAt" timestamp,
	"scopes" text DEFAULT '' NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"lastError" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_classroom_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"connectionId" integer NOT NULL,
	"localCourseId" integer,
	"classroomCourseId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"section" varchar(255),
	"description" text,
	"state" varchar(32) DEFAULT 'ACTIVE' NOT NULL,
	"ownerGoogleUserId" varchar(255),
	"enrollmentCode" varchar(128),
	"lastSyncedAt" timestamp,
	"archivedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "google_classroom_connections" ADD CONSTRAINT "google_classroom_connections_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_classroom_courses" ADD CONSTRAINT "google_classroom_courses_connectionId_google_classroom_connections_id_fk" FOREIGN KEY ("connectionId") REFERENCES "public"."google_classroom_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_classroom_courses" ADD CONSTRAINT "google_classroom_courses_localCourseId_courses_id_fk" FOREIGN KEY ("localCourseId") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "google_classroom_connections_account_idx" ON "google_classroom_connections" USING btree ("googleAccountId");--> statement-breakpoint
CREATE UNIQUE INDEX "google_classroom_connections_user_idx" ON "google_classroom_connections" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "google_classroom_courses_external_idx" ON "google_classroom_courses" USING btree ("connectionId","classroomCourseId");--> statement-breakpoint
CREATE UNIQUE INDEX "google_classroom_courses_local_idx" ON "google_classroom_courses" USING btree ("localCourseId");