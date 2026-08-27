import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("Turmas Externas em smartphones", () => {
  it("evita pressão horizontal e mantém filtros operáveis abaixo de 430px", () => {
    const page = read("app/professor/turmas-externas/page.tsx");
    const styles = read("app/globals.css");

    expect(page).toContain("external-classes-page min-h-screen overflow-x-clip");
    expect(page).toContain("external-class-filters mt-4 grid w-full");
    expect(styles).toContain(".external-class-filters > div:not(:last-child) {");
    expect(styles).toContain("grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);");
  });

  it("oferece abas e chamada em formato compacto, sem tabela larga em 360px", () => {
    const page = read("app/professor/turmas-externas/page.tsx");
    const styles = read("app/globals.css");

    expect(page).toContain('aria-label="Áreas de gestão da turma"');
    expect(page).toContain("external-class-tabs grid grid-cols-2 gap-1.5");
    expect(page).toContain("external-attendance-table overflow-x-auto");
    expect(page).toContain('data-label="Presente"');
    expect(styles).toContain(".external-attendance-table td:not(:first-child)::before");
  });

  it("oferece busca rápida com foco, limpeza e retorno de resultados", () => {
    const page = read("app/professor/turmas-externas/page.tsx");

    expect(page).toContain('id="external-class-quick-search"');
    expect(page).toContain("const focusQuickSearch = () =>");
    expect(page).toContain("handleQuickSearchShortcut");
    expect(page).toContain('aria-label="Limpar busca"');
    expect(page).toContain('aria-live="polite"');
  });
});
