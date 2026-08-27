import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const dashboardSource = readFileSync(new URL("../page.tsx", import.meta.url), "utf8");

describe("estúdio de cursos do professor", () => {
  it("protege a rota com a mesma capacidade do painel docente", () => {
    expect(source).toContain("canAccessProfessorPortal");
    expect(source).toContain('callbackUrl=/professor/cursos');
  });

  it("substitui atalhos administrativos por superfícies docentes", () => {
    expect(dashboardSource).toContain('href="/professor/cursos"');
    expect(dashboardSource).toContain('href="/professor/alunos"');
    expect(dashboardSource).not.toContain('href="/admin/cursos"');
  });
});
