CREATE TABLE "attendances" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" integer NOT NULL,
	"studentId" integer NOT NULL,
	"status" varchar(32) DEFAULT 'present' NOT NULL,
	"notes" text,
	"recordedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer,
	"title" varchar(255) NOT NULL,
	"scheduledAt" timestamp NOT NULL,
	"modality" varchar(32) DEFAULT 'group' NOT NULL,
	"status" varchar(32) DEFAULT 'scheduled' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
