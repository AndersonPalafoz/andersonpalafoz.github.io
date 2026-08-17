CREATE TABLE "external_class_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"externalClassId" integer NOT NULL,
	"date" varchar(32) NOT NULL,
	"attendanceData" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_class_grades" (
	"id" serial PRIMARY KEY NOT NULL,
	"externalClassId" integer NOT NULL,
	"studentId" integer NOT NULL,
	"assessmentTitle" varchar(180) NOT NULL,
	"score" varchar(32) NOT NULL,
	"maxScore" varchar(32) DEFAULT '10.0' NOT NULL,
	"feedback" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_class_materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"externalClassId" integer NOT NULL,
	"title" varchar(180) NOT NULL,
	"fileUrl" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "external_class_attendance" ADD CONSTRAINT "external_class_attendance_externalClassId_external_classes_id_fk" FOREIGN KEY ("externalClassId") REFERENCES "public"."external_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD CONSTRAINT "external_class_grades_externalClassId_external_classes_id_fk" FOREIGN KEY ("externalClassId") REFERENCES "public"."external_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_class_grades" ADD CONSTRAINT "external_class_grades_studentId_external_students_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."external_students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_class_materials" ADD CONSTRAINT "external_class_materials_externalClassId_external_classes_id_fk" FOREIGN KEY ("externalClassId") REFERENCES "public"."external_classes"("id") ON DELETE cascade ON UPDATE no action;