import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("Saved materials contract", () => {
  it("defines a unique user/material persistence model", () => {
    const schema = read("drizzle/schema.ts");
    expect(schema).toMatch(/pgTable\(\s*["']saved_materials["']/);
    expect(schema).toContain("saved_materials_user_material_idx");
    expect(schema).toContain("references(() => materials.id");
  });

  it("protects the material save API and supports toggle operations", () => {
    const api = read("app/api/materials/saved/route.ts");
    expect(api).toContain("Autenticação necessária.");
    expect(api).toContain("export async function GET");
    expect(api).toContain("export async function POST");
    expect(api).toContain("export async function DELETE");
    expect(api).toContain("eq(materials.isPublic, true)");
  });

  it("renders an accessible save button with loading and success feedback", () => {
    const button = read("components/save-material-button.tsx");
    const page = read("app/materiais/[id]/page.tsx");
    expect(button).toContain("aria-pressed");
    expect(button).toContain("loading");
    expect(button).toContain("Material salvo para depois.");
    expect(page).toContain("SaveMaterialButton");
    expect(page).toContain("getSavedMaterialIds");
  });
});
