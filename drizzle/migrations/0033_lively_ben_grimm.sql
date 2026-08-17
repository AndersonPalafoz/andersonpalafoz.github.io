CREATE TABLE "external_classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"institution" varchar(120) NOT NULL,
	"className" varchar(180) NOT NULL,
	"courseName" varchar(180) NOT NULL,
	"academicTerm" varchar(50) NOT NULL,
	"teacherId" integer NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_students" (
	"id" serial PRIMARY KEY NOT NULL,
	"externalClassId" integer NOT NULL,
	"name" varchar(180) NOT NULL,
	"email" varchar(320),
	"studentIdNumber" varchar(64),
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "external_classes" ADD CONSTRAINT "external_classes_teacherId_users_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_students" ADD CONSTRAINT "external_students_externalClassId_external_classes_id_fk" FOREIGN KEY ("externalClassId") REFERENCES "public"."external_classes"("id") ON DELETE cascade ON UPDATE no action;