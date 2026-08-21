import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("alinhamento do schema de turmas externas", () => {
  const schemaSource = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
  const migrationSource = readFileSync(
    resolve(process.cwd(), "drizzle/migrations/0059_external_class_support_tables.sql"),
    "utf8",
  );
  const productionAlignment = readFileSync(
    resolve(process.cwd(), "drizzle/migrations/0058_external_classes_production_alignment.sql"),
    "utf8",
  );

  it("mantém as tabelas de suporte no schema Drizzle", () => {
    expect(schemaSource).toContain('pgTable("external_class_attendance"');
    expect(schemaSource).toContain('pgTable("external_class_grades"');
    expect(schemaSource).toContain('pgTable("external_class_materials"');
  });

  it("inclui todas as tabelas consultadas pela rota na migração de produção", () => {
    for (const table of [
      "external_class_attendance",
      "external_class_grades",
      "external_class_materials",
    ]) {
      expect(migrationSource).toContain(`CREATE TABLE IF NOT EXISTS \"${table}\"`);
    }
  });

  it("inclui os metadados acadêmicos adicionados posteriormente", () => {
    for (const column of ["level", "instructor_name", "monitors"]) {
      expect(productionAlignment).toContain(`ADD COLUMN IF NOT EXISTS \"${column}\"`);
    }
    for (const column of ["category", "university", "component"]) {
      expect(productionAlignment).toContain(`ADD COLUMN IF NOT EXISTS \"${column}\"`);
    }
  });
});
