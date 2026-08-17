CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(64) NOT NULL,
	"url" text NOT NULL,
	"fileKey" varchar(500) NOT NULL,
	"size" varchar(64) NOT NULL,
	"tag" varchar(64) DEFAULT 'Geral' NOT NULL,
	"uploaderId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaderId_users_id_fk" FOREIGN KEY ("uploaderId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;