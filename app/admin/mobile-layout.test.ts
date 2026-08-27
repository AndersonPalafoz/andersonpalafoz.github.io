import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("painel administrativo em smartphones", () => {
  it("prioriza ações essenciais e a busca antes do gráfico em telas pequenas", () => {
    const page = read("app/admin/page.tsx");

    expect(page).toContain('mobile: true');
    expect(page).toContain('wideMobile: true');
    expect(page).toContain('site-shell admin-dashboard-page py-4 sm:py-8');
    expect(page).not.toContain('site-shell admin-dashboard-page px-3');
    expect(page).toContain('grid-cols-2 gap-2 sm:grid-cols-2');
    expect(page).toContain('order-2 space-y-4 rounded-3xl p-4 surface-card sm:p-8 lg:order-1');
    expect(page).toContain('order-1 space-y-4 rounded-3xl p-4 surface-card sm:p-8 lg:order-2');
  });

  it("mantém pendências densas e o mapa detalhado acessíveis sem excesso visual", () => {
    const actionCenter = read("components/admin-action-center.tsx");
    const capabilityMap = read("components/admin-capability-map.tsx");
    const globalStyles = read("app/globals.css");

    expect(actionCenter).toContain('grid grid-cols-2 gap-2.5');
    expect(actionCenter).toContain('min-h-40');
    expect(actionCenter).toContain('Filtros das pendências');
    expect(actionCenter).toContain('Maior prioridade');
    expect(actionCenter).toContain('const visibleItems');
    expect(capabilityMap).toContain('<details className="group border-t border-border/70 md:hidden">');
    expect(capabilityMap).toContain('Explorar mapa completo de operações');
    expect(globalStyles).toContain('.admin-dashboard-page .admin-action-grid a');
    expect(globalStyles).toContain('.admin-dashboard-page .page-container');
    expect(globalStyles).not.toContain('.admin-dashboard-page {\n    padding: 0.75rem;');
  });
});
