ALTER TABLE "external_class_attendance" ADD COLUMN "offerId" integer;--> statement-breakpoint
ALTER TABLE "external_class_attendance" ADD CONSTRAINT "external_class_attendance_offerId_course_offers_id_fk" FOREIGN KEY ("offerId") REFERENCES "public"."course_offers"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
WITH legacy AS (
  SELECT eca."externalClassId", eca."date", eca."attendanceData"::jsonb AS attendance_data, o.id AS "offerId"
  FROM "external_class_attendance" eca
  JOIN "course_offers" o ON o."sourceExternalClassId" = eca."externalClassId"
  WHERE eca."offerId" IS NULL
), mapped AS (
  SELECT legacy."offerId", legacy."date",
         jsonb_object_agg(cos.id::text, value) AS attendance_data
  FROM legacy
  CROSS JOIN LATERAL jsonb_each_text(legacy.attendance_data) AS entries(student_key, value)
  JOIN "course_offer_students" cos
    ON cos."offerId" = legacy."offerId"
   AND cos."externalStudentId" = entries.student_key::integer
  GROUP BY legacy."offerId", legacy."date"
)
UPDATE "course_offer_attendance" coa
SET "attendanceData" = mapped.attendance_data::text,
    "updatedAt" = NOW()
FROM mapped
WHERE coa."offerId" = mapped."offerId"
  AND coa."date" = mapped."date";
--> statement-breakpoint
WITH legacy AS (
  SELECT eca."externalClassId", eca."date", eca."attendanceData"::jsonb AS attendance_data, o.id AS "offerId"
  FROM "external_class_attendance" eca
  JOIN "course_offers" o ON o."sourceExternalClassId" = eca."externalClassId"
  WHERE eca."offerId" IS NULL
), mapped AS (
  SELECT legacy."offerId", legacy."date",
         jsonb_object_agg(cos.id::text, value) AS attendance_data
  FROM legacy
  CROSS JOIN LATERAL jsonb_each_text(legacy.attendance_data) AS entries(student_key, value)
  JOIN "course_offer_students" cos
    ON cos."offerId" = legacy."offerId"
   AND cos."externalStudentId" = entries.student_key::integer
  GROUP BY legacy."offerId", legacy."date"
)
INSERT INTO "course_offer_attendance" ("offerId", "date", "attendanceData")
SELECT mapped."offerId", mapped."date", mapped.attendance_data::text
FROM mapped
WHERE NOT EXISTS (
  SELECT 1 FROM "course_offer_attendance" coa
  WHERE coa."offerId" = mapped."offerId" AND coa."date" = mapped."date"
);
