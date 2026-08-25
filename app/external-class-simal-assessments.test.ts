import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("SIMAL external-class assessments", () => {
  it("keeps the database metadata additive and compatible with freeform grades", () => {
    const schema = read("drizzle/schema.ts");
    expect(schema).toContain('assessmentType: varchar("assessmentType"');
    expect(schema).toContain('assessmentVersion: varchar("assessmentVersion"');
    expect(schema).toContain('assessmentComponent: varchar("assessmentComponent"');
    expect(schema).toContain('rubricScores: text("rubricScores")');
    expect(schema).toContain('assessmentDate: varchar("assessmentDate"');
    expect(schema).toContain('default("custom")');
  });

  it("exposes versioned assessment presets and all graded components", () => {
    const page = read("app/professor/turmas-externas/page.tsx");
    for (const value of ["simal-units-1-2-4", "simal-units-1-2-4-b", "simal-speaking", "simal-presentation", "grammar", "reading", "writing", "listening", "speaking", "presentation"]) {
      expect(page).toContain(value);
    }
    expect(page).toContain("Lançamento SIMAL por aluno");
    expect(page).toContain("Preencha somente os alunos avaliados");
    expect(page).toContain("handleSaveSimalBatch");
  });

  it("persists assessment metadata and rejects scores outside the configured range", () => {
    const route = read("app/api/professor/external-classes/route.ts");
    expect(route).toContain("validateGrade");
    expect(route).toContain("assessmentType");
    expect(route).toContain("assessmentVersion");
    expect(route).toContain("assessmentComponent");
    expect(route).toContain("rubricScores");
    expect(route).toContain("A nota deve estar entre 0 e");
  });
});

export {};
