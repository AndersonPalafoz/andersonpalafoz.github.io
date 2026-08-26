ALTER TABLE "certificates" ALTER COLUMN "userId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "courseId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "recipientName" varchar(255);--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "recipientEmail" varchar(320);--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "recipientCpf" varchar(20);--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;