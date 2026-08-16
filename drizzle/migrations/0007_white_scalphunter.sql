CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "approvalStatus" "approval_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
UPDATE "users" SET "approvalStatus" = 'approved' WHERE "approvalStatus" = 'pending';