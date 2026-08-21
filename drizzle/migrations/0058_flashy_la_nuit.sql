CREATE TABLE "certificate_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"category" varchar(50) DEFAULT 'internal' NOT NULL,
	"institution" varchar(120),
	"isDefault" boolean DEFAULT false NOT NULL,
	"templateUrl" text,
	"includeSiteBranding" boolean DEFAULT true NOT NULL,
	"fieldMappings" text,
	"createdBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;