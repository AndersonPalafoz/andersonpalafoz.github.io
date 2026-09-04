import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

describe("external class enrollment policy", () => {
  it("blocks learner self-enrollment in externally sourced offers", () => {
    const route = read("app/api/enrollments/route.ts");
    expect(route).toContain("sourceExternalClassId");
    expect(route).toContain("Turmas externas não aceitam autoinscrição");
    expect(route).toContain('session.user.role === "admin"');
    expect(route).toContain('session.user.role === "super_admin"');
  });

  it("keeps external class enrollment contextual to an existing offer", () => {
    const catalog = read("app/cursos/page.tsx");
    expect(catalog).toContain('Number(c.courseType) !== 4');
    expect(catalog).toContain('c.category !== "Curso Externo / Avulso"');
  });
});
