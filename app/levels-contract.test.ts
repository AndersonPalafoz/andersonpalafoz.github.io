import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homepage = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const classesPage = readFileSync(new URL("./aulas/page.tsx", import.meta.url), "utf8");
const materialsPage = readFileSync(new URL("./materiais/page.tsx", import.meta.url), "utf8");

describe("CEFR communication contract", () => {
  it("communicates that public classes run from A1 to B2", () => {
    expect(homepage).toContain("A1–B2");
    expect(homepage).toContain("Níveis das aulas");
    expect(homepage).toContain("Aulas organizadas do A1 ao B2");
    expect(homepage).toContain("Cursos estruturados do A1 ao B2");
    expect(classesPage).toContain("cursos do A1 ao B2");
    expect(classesPage).toContain("Cursos estruturados do A1 ao B2");
    expect(classesPage).not.toContain("cursos de A1 a C2");
  });

  it("communicates that the materials library can reach C1 and C2", () => {
    expect(homepage).toContain("materiais que podem chegar aos níveis C1 e C2");
    expect(materialsPage).toContain("podem alcançar os níveis C1 e C2");
    expect(materialsPage).toContain("A1-C2");
  });
});
