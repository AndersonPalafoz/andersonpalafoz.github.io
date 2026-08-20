import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const adminCoursesPagePath = path.join(process.cwd(), "app/admin/cursos/page.tsx");

describe("Admin courses filtering by type and modality", () => {
  it("includes typeFilter and modalityFilter state variables and selection controls", () => {
    const source = fs.readFileSync(adminCoursesPagePath, "utf8");
    expect(source).toContain("typeFilter");
    expect(source).toContain("modalityFilter");
    expect(source).toContain("COURSE_TYPE_OPTIONS");
    expect(source).toContain("Filtrar por tipo de curso");
    expect(source).toContain("Filtrar por modalidade");
    expect(source).toContain("Limpar filtros");
  });
});
