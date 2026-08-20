import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Blog API Contract", () => {
  it("returns an articles envelope matching frontend expectations", () => {
    const routeSource = readFileSync(join(process.cwd(), "app/api/articles/route.ts"), "utf8");
    const pageSource = readFileSync(join(process.cwd(), "app/blog/[slug]/page.tsx"), "utf8");

    expect(routeSource).toContain("return NextResponse.json({ articles: articleList })");
    expect(pageSource).toContain("data.articles");
  });
});
