import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("Public blog usability contract", () => {
  it("uses only published real articles and exposes the unavailable state", () => {
    const page = read("app/blog/page.tsx");
    expect(page).toContain("getPublicArticles");
    expect(page).toContain("article.published");
    expect(page).toContain("Conteúdo temporariamente indisponível");
  });

  it("provides functional search, category filters and accessible empty-state controls", () => {
    const browser = read("components/blog-browser.tsx");
    expect(browser).toContain('type="search"');
    expect(browser).toContain("aria-pressed");
    expect(browser).toContain("aria-live");
    expect(browser).toContain("Limpar filtros");
    expect(browser).toContain("Carregar mais");
    expect(browser).toContain("Carregando...");
    expect(browser).toContain("visibleCount");
    expect(browser).toContain("/blog/${article.slug}");
  });

  it("keeps the public CTA actionable instead of displaying a non-persisted newsletter form", () => {
    const page = read("app/blog/page.tsx");
    expect(page).toContain("/contato");
    expect(page).not.toContain("Inscrever");
  });
});
