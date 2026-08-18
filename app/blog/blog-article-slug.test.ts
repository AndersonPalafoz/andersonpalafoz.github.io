import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("Blog individual article route contract", () => {
  it("uses real data fetching, comments state and breadcrumbs on /blog/[slug]", () => {
    const page = read("app/blog/[slug]/page.tsx");
    expect(page).toContain("params");
    expect(page).toContain("fetch(\"/api/articles\")");
    expect(page).toContain("Breadcrumbs");
    expect(page).toContain("handleCommentSubmit");
    expect(page).toContain("Avaliações e Comentários");
  });
});
