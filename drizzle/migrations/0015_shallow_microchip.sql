CREATE TABLE "speaking_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"activityId" integer NOT NULL,
	"attemptNumber" integer DEFAULT 1 NOT NULL,
	"audioResponseUrl" varchar(1000) NOT NULL,
	"transcript" text,
	"aiScore" integer,
	"aiFeedback" text,
	"aiSuggestions" text,
	"teacherFeedback" text,
	"teacherAudioFeedbackUrl" varchar(1000),
	"submittedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "certificateCode" varchar(64);--> statement-breakpoint
ALTER TABLE "userActivityProgress" ADD COLUMN "teacherAudioFeedbackUrl" varchar(1000);--> statement-breakpoint
CREATE UNIQUE INDEX "speaking_attempt_identity_idx" ON "speaking_attempts" USING btree ("userId","activityId","attemptNumber");