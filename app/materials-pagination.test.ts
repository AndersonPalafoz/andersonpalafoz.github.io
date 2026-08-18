import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("Public materials pagination contract", () => {
  it("limits server responses and exposes hasMore metadata", () => {
    const api = read("app/api/materials/route.ts");
    expect(api).toContain("DEFAULT_PAGE_SIZE = 24");
    expect(api).toContain("MAX_PAGE_SIZE = 60");
    expect(api).toContain("limit(pageSize + 1)");
    expect(api).toContain("hasMore: rows.length > pageSize");
    expect(api).toContain("offset((page - 1) * pageSize)");
  });

  it("applies search and filters on the server before returning a page", () => {
    const api = read("app/api/materials/route.ts");
    expect(api).toContain('request.nextUrl.searchParams.get("search")');
    expect(api).toContain('request.nextUrl.searchParams.get("level")');
    expect(api).toContain('request.nextUrl.searchParams.get("category")');
    expect(api).toContain("ilike(materials.title");
    expect(api).toContain("ilike(materials.description");
  });

  it("does not cache personalized material results publicly", () => {
    const api = read("app/api/materials/route.ts");
    expect(api).toContain('"private, no-store"');
    expect(api).toContain('session?.user?.email ? "private, no-store"');
  });

  it("offers an accessible incremental loading state in the UI", () => {
    const page = read("app/materiais/page.tsx");
    expect(page).toContain("Carregar mais materiais");
    expect(page).toContain("loadingMore");
    expect(page).toContain("Exibindo {filteredMaterials.length} de {meta.total} materiais");
    expect(page).toContain('role="alert"');
  });
});
