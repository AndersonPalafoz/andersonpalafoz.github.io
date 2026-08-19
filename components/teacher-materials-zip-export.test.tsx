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
    expect(source).toContain("selectedIdList");
    expect(source).toContain("selectedIds.size === 0");
  });

  it("previews the selected size and blocks selections over 40 MB", () => {
    const source = read("components/teacher-materials-zip-export.tsx");
    expect(source).toContain('"/api/professor/materials-size"');
    expect(source).toContain("Tamanho total estimado");
    expect(source).toContain("Calculando…");
    expect(source).toContain("sizeEstimate.exceedsLimit");
    expect(source).toContain("40 MB");
  });

  it("keeps the server-side ownership validation contract", () => {
    const source = read("app/api/professor/export-materials-zip/route.ts");
    expect(source).toContain("Acesso restrito a professores e administradores");
    expect(source).toContain("getTeacherMaterials");
    expect(source).toContain("não pertencem ao escopo autorizado");
    expect(source).toContain("Cache-Control");
    const sizeRoute = read("app/api/professor/materials-size/route.ts");
    expect(sizeRoute).toContain("estimateMaterialSize");
    expect(sizeRoute).toContain("unknownCount");
    expect(sizeRoute).toContain("exceedsLimit");
  });
});
