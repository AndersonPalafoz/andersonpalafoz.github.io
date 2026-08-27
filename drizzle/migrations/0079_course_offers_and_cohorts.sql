CREATE TABLE "course_offer_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"offerId" integer NOT NULL,
	"date" varchar(32) NOT NULL,
	"attendanceData" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_offer_students" (
	"id" serial PRIMARY KEY NOT NULL,
	"offerId" integer NOT NULL,
	"userId" integer,
	"externalStudentId" integer,
	"name" varchar(180) NOT NULL,
	"socialName" varchar(160),
	"email" varchar(320),
	"studentIdNumber" varchar(64),
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"notes" text,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_offer_teacher_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"offerId" integer NOT NULL,
	"teacherId" integer NOT NULL,
	"assignedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer NOT NULL,
	"sourceExternalClassId" integer,
	"institution" varchar(120),
	"offerName" varchar(180) NOT NULL,
	"academicTerm" varchar(50) NOT NULL,
	"ownerTeacherId" integer NOT NULL,
	"description" text,
	"class_days" varchar(255),
	"class_time" varchar(100),
	"workload_hours" integer DEFAULT 40,
	"start_date" timestamp,
	"end_date" timestamp,
	"duration_type" varchar(32) DEFAULT 'semester',
	"duration_value" integer,
	"duration_unit" varchar(24),
	"modality" varchar(32) DEFAULT 'Remota',
	"meeting_link" varchar(500),
	"classroom_location" varchar(255),
	"max_absence_percent" integer DEFAULT 25,
	"has_units" boolean DEFAULT false NOT NULL,
	"unit_count" integer DEFAULT 1,
	"grading_scope" varchar(16) DEFAULT 'course' NOT NULL,
	"grading_policy" varchar(32) DEFAULT 'standard' NOT NULL,
	"passing_average" varchar(8) DEFAULT '6' NOT NULL,
	"unit_passing_averages" text,
	"grade_status" varchar(16) DEFAULT 'open' NOT NULL,
	"status" varchar(24) DEFAULT 'draft' NOT NULL,
	"deleted_at" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_offer_attendance" ADD CONSTRAINT "course_offer_attendance_offerId_course_offers_id_fk" FOREIGN KEY ("offerId") REFERENCES "public"."course_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offer_students" ADD CONSTRAINT "course_offer_students_offerId_course_offers_id_fk" FOREIGN KEY ("offerId") REFERENCES "public"."course_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offer_students" ADD CONSTRAINT "course_offer_students_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offer_students" ADD CONSTRAINT "course_offer_students_externalStudentId_external_students_id_fk" FOREIGN KEY ("externalStudentId") REFERENCES "public"."external_students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offer_teacher_assignments" ADD CONSTRAINT "course_offer_teacher_assignments_offerId_course_offers_id_fk" FOREIGN KEY ("offerId") REFERENCES "public"."course_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offer_teacher_assignments" ADD CONSTRAINT "course_offer_teacher_assignments_teacherId_users_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offer_teacher_assignments" ADD CONSTRAINT "course_offer_teacher_assignments_assignedBy_users_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offers" ADD CONSTRAINT "course_offers_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offers" ADD CONSTRAINT "course_offers_sourceExternalClassId_external_classes_id_fk" FOREIGN KEY ("sourceExternalClassId") REFERENCES "public"."external_classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offers" ADD CONSTRAINT "course_offers_ownerTeacherId_users_id_fk" FOREIGN KEY ("ownerTeacherId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_offer_attendance_offer_date_unique" ON "course_offer_attendance" USING btree ("offerId","date");--> statement-breakpoint
CREATE UNIQUE INDEX "course_offer_students_offer_user_unique" ON "course_offer_students" USING btree ("offerId","userId");--> statement-breakpoint
CREATE UNIQUE INDEX "course_offer_students_offer_external_unique" ON "course_offer_students" USING btree ("offerId","externalStudentId");--> statement-breakpoint
CREATE UNIQUE INDEX "course_offer_teacher_assignments_unique" ON "course_offer_teacher_assignments" USING btree ("offerId","teacherId");--> statement-breakpoint
CREATE UNIQUE INDEX "course_offers_course_term_name_unique" ON "course_offers" USING btree ("courseId","academicTerm","offerName");--> statement-breakpoint
