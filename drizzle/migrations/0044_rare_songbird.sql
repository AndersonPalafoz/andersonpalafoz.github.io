CREATE TABLE "teacher_zip_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"filename" varchar(255) NOT NULL,
	"materialCount" integer NOT NULL,
	"totalBytes" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teacher_zip_exports" ADD CONSTRAINT "teacher_zip_exports_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;