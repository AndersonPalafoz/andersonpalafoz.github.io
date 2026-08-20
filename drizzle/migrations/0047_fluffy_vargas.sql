ALTER TABLE "external_classes" ADD COLUMN IF NOT EXISTS "modality" varchar(32) DEFAULT 'Remota';
ALTER TABLE "external_classes" ADD COLUMN IF NOT EXISTS "meeting_link" varchar(500);
ALTER TABLE "external_classes" ADD COLUMN IF NOT EXISTS "classroom_location" varchar(255);
