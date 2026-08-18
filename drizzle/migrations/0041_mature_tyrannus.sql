CREATE TABLE "saved_materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"materialId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saved_materials" ADD CONSTRAINT "saved_materials_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_materials" ADD CONSTRAINT "saved_materials_materialId_materials_id_fk" FOREIGN KEY ("materialId") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "saved_materials_user_material_idx" ON "saved_materials" USING btree ("userId","materialId");