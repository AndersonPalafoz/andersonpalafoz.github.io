import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("painel do aluno", () => {
  it("oferece cartões de histórico no mobile antes da tabela desktop", () => {
    expect(source).toContain('className="space-y-3 p-4 md:hidden"');
    expect(source).toContain("Acessar curso");
    expect(source).toContain('className="hidden overflow-x-auto md:block"');
  });

  it("mantém continuidade pela última aula e exclui cursos técnicos", () => {
    expect(source).toContain("getResumeLesson");
    expect(source).toContain("isLearnerVisibleCourse");
    expect(source).toContain("Continuar da última aula");
  });
});
