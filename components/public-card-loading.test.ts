import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("public catalog card states", () => {
  it("uses the shared interactive card motion in the live course catalog", () => {
    const source = read("components/course-catalog.tsx");
    expect(source).toContain("surface-card interactive-card");
    expect(source).toContain("field-control");
    expect(source).toContain("empty-state");
  });

  it("provides route-level skeletons for courses and blog", () => {
    expect(read("app/aulas/loading.tsx")).toContain("Carregando cursos disponíveis");
    expect(read("app/aulas/loading.tsx")).toContain("animate-pulse");
    expect(read("app/blog/loading.tsx")).toContain("Carregando artigos publicados");
    expect(read("app/blog/loading.tsx")).toContain("surface-card");
  });
});
