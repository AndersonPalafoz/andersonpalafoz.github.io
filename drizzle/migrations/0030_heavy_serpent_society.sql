CREATE TABLE "speaking_assistant_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"promptText" text NOT NULL,
	"audioUrl" text,
	"aiFeedback" text NOT NULL,
	"score" integer DEFAULT 85 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_gamification_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"level" varchar(50) DEFAULT 'Explorer (A1)' NOT NULL,
	"streakDays" integer DEFAULT 1 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) DEFAULT 'info' NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "speaking_assistant_history" ADD CONSTRAINT "speaking_assistant_history_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gamification_points" ADD CONSTRAINT "user_gamification_points_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_gamification_user_idx" ON "user_gamification_points" USING btree ("userId");