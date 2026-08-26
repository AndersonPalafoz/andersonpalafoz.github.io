ALTER TABLE "certificates"
  ADD COLUMN IF NOT EXISTS "recipientName" varchar(255),
  ADD COLUMN IF NOT EXISTS "recipientEmail" varchar(320),
  ADD COLUMN IF NOT EXISTS "recipientCpf" varchar(20);

ALTER TABLE "certificates"
  ALTER COLUMN "userId" DROP NOT NULL,
  ALTER COLUMN "userId" DROP DEFAULT;
