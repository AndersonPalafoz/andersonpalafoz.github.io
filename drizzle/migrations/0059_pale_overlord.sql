ALTER TABLE "certificates" ADD COLUMN "certificateTemplateId" integer;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "includeSiteBranding" boolean DEFAULT true NOT NULL;