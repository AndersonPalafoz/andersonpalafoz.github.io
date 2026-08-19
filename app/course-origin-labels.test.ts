import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Course origin labels", () => {
  it("identifies internal courses in the public catalog", () => {
    const catalogPath = path.join(process.cwd(), "components/course-catalog.tsx");
    const source = fs.readFileSync(catalogPath, "utf8");

    expect(source).toContain('aria-label="Origem: Curso interno"');
    expect(source).toContain("Curso interno");
  });

  it("identifies external institutional classes in the teacher list", () => {
    const externalClassesPath = path.join(process.cwd(), "app/professor/turmas-externas/page.tsx");
    const source = fs.readFileSync(externalClassesPath, "utf8");

    expect(source).toContain('aria-label="Origem: Turma externa institucional"');
    expect(source).toContain("Turma externa");
  });
});
