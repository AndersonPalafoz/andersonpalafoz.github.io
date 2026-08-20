import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("EnrollButton resume contract", () => {
  const source = readFileSync(join(process.cwd(), "components/enroll-button.tsx"), "utf8");

  it("recebe a aula pendente e usa a rota do player para continuar", () => {
    expect(source).toContain("resumeLessonId?: number | null");
    expect(source).toContain("/cursos/${courseId}/aulas/${resumeLessonId}");
    expect(source).toContain('aria-label={resumeLessonId ? "Continuar na próxima aula pendente"');
  });

  it("não aninha um botão dentro de um Link", () => {
    expect(source).not.toContain("<Link href={`/cursos/${courseId}`}>");
    expect(source).not.toContain("<button className=\"bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl");
  });
});
