CREATE TABLE "manual_access_grants" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"courseId" integer,
	"materialId" integer,
	"grantedBy" integer NOT NULL,
	"reason" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "manual_access_grants" ADD CONSTRAINT "manual_access_grants_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_access_grants" ADD CONSTRAINT "manual_access_grants_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_access_grants" ADD CONSTRAINT "manual_access_grants_materialId_materials_id_fk" FOREIGN KEY ("materialId") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_access_grants" ADD CONSTRAINT "manual_access_grants_grantedBy_users_id_fk" FOREIGN KEY ("grantedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "manual_access_user_course_idx" ON "manual_access_grants" USING btree ("userId","courseId");--> statement-breakpoint
CREATE UNIQUE INDEX "manual_access_user_material_idx" ON "manual_access_grants" USING btree ("userId","materialId");