import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("relatórios administrativos", () => {
  it("respeita a capacidade administrativa em vez de comparar somente uma string de papel", () => {
    expect(source).toContain("if (!user || !canAccessAdmin) return null;");
    expect(source).toContain("setDetailsLoading(true);");
    expect(source).toContain("Acompanhamento operacional de alunos, professores e cursos.");
  });
});
