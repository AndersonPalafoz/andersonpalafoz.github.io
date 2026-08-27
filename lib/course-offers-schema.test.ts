import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("modelo de ofertas e coortes", () => {
  const schema = readFileSync(join(process.cwd(), "drizzle/schema.ts"), "utf8");
  const migration = readFileSync(join(process.cwd(), "drizzle/migrations/0079_course_offers_and_cohorts.sql"), "utf8");

  it("declara oferta, professores, alunos e frequência contextual", () => {
    expect(schema).toContain('pgTable(\n  "course_offers"');
    expect(schema).toContain('pgTable(\n  "course_offer_teacher_assignments"');
    expect(schema).toContain('pgTable(\n  "course_offer_students"');
    expect(schema).toContain('pgTable(\n  "course_offer_attendance"');
  });

  it("preserva vínculo com curso interno e origem externa opcional", () => {
    expect(schema).toContain('references(() => courses.id, { onDelete: "cascade" })');
    expect(schema).toContain('references(() => externalClasses.id, { onDelete: "set null" })');
    expect(schema).toContain('sourceExternalClassId');
  });

  it("mantém índices de unicidade por escopo da oferta", () => {
    expect(schema).toContain("course_offers_course_term_name_unique");
    expect(schema).toContain("course_offer_teacher_assignments_unique");
    expect(schema).toContain("course_offer_students_offer_user_unique");
    expect(schema).toContain("course_offer_attendance_offer_date_unique");
  });

  it("migration cria apenas a camada nova e não altera dados legados", () => {
    expect(migration).toContain('CREATE TABLE "course_offers"');
    expect(migration).toContain('CREATE TABLE "course_offer_students"');
    expect(migration).not.toMatch(/DROP TABLE|DROP COLUMN|TRUNCATE|DELETE FROM|ALTER TABLE "external_classes" ADD COLUMN/);
  });
});
