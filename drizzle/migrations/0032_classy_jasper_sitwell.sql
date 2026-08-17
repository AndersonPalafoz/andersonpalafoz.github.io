CREATE TABLE "medals_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(32) NOT NULL,
	"category" varchar(50) DEFAULT 'achievement' NOT NULL,
	"requirement" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "medals_catalog_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_medals" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"medalCode" varchar(64) NOT NULL,
	"awardedBy" integer,
	"grantType" varchar(32) DEFAULT 'automatic' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_medals" ADD CONSTRAINT "user_medals_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_medals" ADD CONSTRAINT "user_medals_awardedBy_users_id_fk" FOREIGN KEY ("awardedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "themePreference";