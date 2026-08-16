CREATE TABLE "course_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"courseId" integer NOT NULL,
	"stripeCheckoutSessionId" varchar(255) NOT NULL,
	"stripePaymentIntentId" varchar(255),
	"stripeCustomerId" varchar(255),
	"fulfilledAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_purchases_stripeCheckoutSessionId_unique" UNIQUE("stripeCheckoutSessionId")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "modality" varchar(32) DEFAULT 'individual';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "isFree" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "price" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "imageUrl" varchar(1000);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "audioUrl" varchar(1000);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "videoUrl" varchar(1000);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "stripeProductId" varchar(255);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "stripePriceId" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripeCustomerId" varchar(255);--> statement-breakpoint
ALTER TABLE "course_purchases" ADD CONSTRAINT "course_purchases_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_purchases" ADD CONSTRAINT "course_purchases_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;