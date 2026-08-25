import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("Dashboard resilience", () => {
  it("mantém as consultas independentes quando uma fonte de dados falha", () => {
    expect(pageSource).toContain("Promise.allSettled");
    expect(pageSource).toContain('results[0].status === "fulfilled"');
    expect(pageSource).toContain("Falha na consulta");
    expect(pageSource).toContain("getResumeLesson(userId, enrollment.course.id).catch");
  });

  it("isola a consulta de turmas externas para não ocultar o painel principal", () => {
    expect(pageSource).toContain('Falha ao carregar dados de turmas externas:');
    expect(pageSource).toMatch(/try \{[\s\S]*externalStudents\.findMany[\s\S]*catch \(error\)/);
  });
});
