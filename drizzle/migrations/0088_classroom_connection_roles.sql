ALTER TABLE "google_classroom_connections" ADD COLUMN "authorizedRole" varchar(32) DEFAULT 'teacher' NOT NULL;--> statement-breakpoint
ALTER TABLE "google_classroom_connections" ADD COLUMN "lastSyncStatus" varchar(32);--> statement-breakpoint
ALTER TABLE "google_classroom_connections" ADD COLUMN "lastSyncAt" timestamp;--> statement-breakpoint
ALTER TABLE "google_classroom_connections" ADD COLUMN "consentedAt" timestamp;--> statement-breakpoint
ALTER TABLE "google_classroom_connections" ADD COLUMN "revokedAt" timestamp;