CREATE TABLE "external_class_teacher_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"externalClassId" integer NOT NULL,
	"teacherId" integer NOT NULL,
	"assignedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "external_class_teacher_assignments" ADD CONSTRAINT "external_class_teacher_assignments_externalClassId_external_classes_id_fk" FOREIGN KEY ("externalClassId") REFERENCES "public"."external_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_class_teacher_assignments" ADD CONSTRAINT "external_class_teacher_assignments_teacherId_users_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_class_teacher_assignments" ADD CONSTRAINT "external_class_teacher_assignments_assignedBy_users_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "external_class_teacher_assignments_unique" ON "external_class_teacher_assignments" USING btree ("externalClassId","teacherId");