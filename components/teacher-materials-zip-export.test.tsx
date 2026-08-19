import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("teacher materials ZIP selector", () => {
  it("renders explicit checkboxes, bulk selection and a selected count", () => {
    const source = read("components/teacher-materials-zip-export.tsx");
    expect(source).toContain('type="checkbox"');
    expect(source).toContain("Selecionar todos");
    expect(source).toContain("selectedCount");
    expect(source).toContain("aria-live");
  });

  it("sends only selected material IDs to the protected endpoint", () => {
    const source = read("components/teacher-materials-zip-export.tsx");
    expect(source).toContain('"/api/professor/export-materials-zip"');
    expect(source).toContain("Array.from(selectedIds)");
    expect(source).toContain("selectedIds.size === 0");
  });

  it("keeps the server-side ownership validation contract", () => {
    const source = read("app/api/professor/export-materials-zip/route.ts");
    expect(source).toContain("Acesso restrito a professores e administradores");
    expect(source).toContain("getTeacherMaterials");
    expect(source).toContain("não pertencem ao escopo autorizado");
    expect(source).toContain("Cache-Control");
  });
});
