import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const coursesPage = readFileSync(new URL("./cursos/page.tsx", import.meta.url), "utf8");
const aboutPage = readFileSync(new URL("./sobre/page.tsx", import.meta.url), "utf8");
const levelsUtility = readFileSync(new URL("../lib/levels.ts", import.meta.url), "utf8");

describe("CEFR communication contract", () => {
  it("communicates that public courses run from basic to advanced", () => {
    expect(coursesPage).toContain("Básico ao Avançado");
  });

  it("formats advanced materials with the complete C1-C2 range", () => {
    expect(levelsUtility).toContain('return "Avançado [C1-C2]"');
  });

  it("communicates the same CEFR distinction on the About page and metadata", () => {
    expect(aboutPage).toContain("Básico");
    expect(aboutPage).toContain("Avançado");
  });
});
