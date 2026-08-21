ALTER TABLE "certificates" ADD COLUMN "signatureType" varchar(16) DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "signedPdfUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "signedAt" timestamp;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "signedBy" integer;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_signedBy_users_id_fk" FOREIGN KEY ("signedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;