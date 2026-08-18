import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homepage = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

const aboutPage = readFileSync(new URL("./sobre/page.tsx", import.meta.url), "utf8");

describe("CEFR communication contract", () => {
  it("communicates that public classes run from basic to advanced", () => {
    expect(homepage).toContain("Básico ao Avançado");
    expect(homepage).toContain("Níveis das aulas");
  });

  it("communicates that the materials library reaches C1 and C2 in parallel", () => {
    expect(homepage).toContain("Avançado [C1-C2]");
  });

  it("communicates the same CEFR distinction on the About page and metadata", () => {
    expect(aboutPage).toContain("Básico");
    expect(aboutPage).toContain("Avançado");
  });
});
