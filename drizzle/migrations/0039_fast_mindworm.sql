CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL,
	"stripeCouponId" varchar(255) NOT NULL,
	"percentOff" varchar(32),
	"amountOff" varchar(32),
	"currency" varchar(3) DEFAULT 'brl' NOT NULL,
	"maxRedemptions" integer,
	"redeemBy" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code"),
	CONSTRAINT "coupons_stripeCouponId_unique" UNIQUE("stripeCouponId")
);
--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;