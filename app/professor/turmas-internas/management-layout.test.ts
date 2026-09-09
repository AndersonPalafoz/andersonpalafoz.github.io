import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("internal class management layout", () => {
  it("routes the primary action to the explicit internal-class creation flow", () => {
    const source = read("components/internal-classes-workspace.tsx");
    expect(source).toContain("CreateInternalClassDialog");
    expect(source).not.toContain('href="/professor/cursos"');
  });

  it("exposes the operational tabs and preserves the internal domain boundary", () => {
    const detail = read("components/internal-class-detail-tabs.tsx");
    const page = read("app/professor/turmas-internas/[id]/page.tsx");
    expect(detail).toContain("Visão geral");
    expect(detail).toContain("Presença");
    expect(detail).toContain("Atividades");
    expect(detail).toContain("Progresso");
    expect(page).toContain("isNull(courseOffers.sourceExternalClassId)");
    expect(page).toContain("isNull(courseOfferStudents.externalStudentId)");
  });
});
