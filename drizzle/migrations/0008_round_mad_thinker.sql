CREATE TABLE "admin_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"adminEmail" varchar(320) NOT NULL,
	"action" varchar(64) NOT NULL,
	"targetName" text,
	"targetEmail" varchar(320),
	"details" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
