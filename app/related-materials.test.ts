import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("Related materials contract", () => {
  it("defines getRelatedMaterials helper in lib/db.ts", () => {
    const dbFile = read("lib/db.ts");
    expect(dbFile).toContain("export async function getRelatedMaterials");
    expect(dbFile).toContain("category");
    expect(dbFile).toContain("level");
  });

  it("renders related materials section in material detail page", () => {
    const page = read("app/materiais/[id]/page.tsx");
    expect(page).toContain("Materiais Relacionados");
    expect(page).toContain("RelatedMaterialsList");
    expect(page).toContain("getRelatedMaterials");
  });
});
