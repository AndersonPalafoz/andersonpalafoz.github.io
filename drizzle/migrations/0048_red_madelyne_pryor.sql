CREATE TABLE "admin_activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"userEmail" varchar(320),
	"userName" varchar(255),
	"action" varchar(64) NOT NULL,
	"targetType" varchar(64) DEFAULT 'course' NOT NULL,
	"targetIds" text NOT NULL,
	"details" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
