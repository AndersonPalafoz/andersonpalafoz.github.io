import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const catalogPath = path.join(process.cwd(), "components/course-catalog.tsx");
const legendPath = path.join(process.cwd(), "components/course-type-legend.tsx");
const detailPath = path.join(process.cwd(), "app/cursos/[id]/page.tsx");

describe("public course types experience", () => {
  it("offers accessible quick filters for all official course types", () => {
    const source = fs.readFileSync(catalogPath, "utf8");
    expect(source).toContain("Filtros rápidos por tipo de curso");
    expect(source).toContain("aria-pressed");
    expect(source).toContain("COURSE_TYPE_OPTIONS.map");
  });

  it("documents the five modalities in an interactive public legend", () => {
    const source = fs.readFileSync(legendPath, "utf8");
    expect(source).toContain("Como funcionam os tipos de curso?");
    expect(source).toContain("<details");
    expect(source).toContain("COURSE_TYPE_OPTIONS.map");
    expect(source).toContain("Tipo {courseType.id}");
  });

  it("uses dedicated CTAs for personalized and in-person courses", () => {
    const source = fs.readFileSync(detailPath, "utf8");
    expect(source).toContain("Solicitar um percurso personalizado");
    expect(source).toContain("Entrar em contato para agendar");
    expect(source).toContain("/contato?curso=");
  });
});
