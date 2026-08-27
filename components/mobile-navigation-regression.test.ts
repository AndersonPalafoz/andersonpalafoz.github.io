import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("navegação em smartphones", () => {
  it("mantém o menu público acessível, dispensável e sem rolagem do documento ao abrir", () => {
    const source = read("components/navbar.tsx");

    expect(source).toContain('document.body.style.overflow = "hidden"');
    expect(source).toContain('event.key === "Escape"');
    expect(source).toContain('aria-controls="mobile-navigation"');
    expect(source).toContain('aria-label="Menu de navegação"');
    expect(source).toContain("max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain");
    expect(source).toContain('href="/dashboard"');
  });

  it("mantém a navegação protegida utilizável em telas pequenas e áreas seguras", () => {
    const shell = read("app/dashboard/dashboard-shell.tsx");
    const styles = read("app/globals.css");

    expect(shell).toContain('aria-controls="dashboard-mobile-navigation"');
    expect(shell).toContain('event.key === "Escape"');
    expect(shell).toContain("min-h-12 min-w-0 flex-col");
    expect(shell).toContain('id="dashboard-mobile-navigation"');
    expect(styles).toContain("bottom: max(0.75rem, env(safe-area-inset-bottom));");
    expect(styles).toContain("padding-bottom: calc(6.5rem + env(safe-area-inset-bottom));");
    expect(shell).toContain("overflow-visible md:overflow-hidden");
    expect(shell).toContain("min-h-0 flex-1 overflow-visible");
    expect(styles).toContain("overscroll-behavior-y: auto;");
  });

  it("mantém o hero administrativo e suas ações dentro da largura móvel", () => {
    const adminPage = read("app/admin/page.tsx");
    const styles = read("app/globals.css");

    expect(adminPage).toContain('index > 3 ? "hidden md:flex" : "flex"');
    expect(styles).toContain(".admin-dashboard-hero {");
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr);");
  });
});
