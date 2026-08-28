ALTER TABLE "external_class_grades" ADD COLUMN "offerId" integer;--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD COLUMN "courseOfferStudentId" integer;--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD CONSTRAINT "external_class_grades_offerId_course_offers_id_fk" FOREIGN KEY ("offerId") REFERENCES "public"."course_offers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD CONSTRAINT "external_class_grades_courseOfferStudentId_course_offer_students_id_fk" FOREIGN KEY ("courseOfferStudentId") REFERENCES "public"."course_offer_students"("id") ON DELETE set null ON UPDATE no action;

--> statement-breakpoint
UPDATE "external_class_grades" AS g
SET "offerId" = o.id,
    "courseOfferStudentId" = cos.id
FROM "course_offers" AS o
JOIN "course_offer_students" AS cos
  ON cos."offerId" = o.id
 AND cos."externalStudentId" = g."studentId"
WHERE o."sourceExternalClassId" = g."externalClassId"
  AND g."offerId" IS NULL;
