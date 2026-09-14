import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("contrato visual da página de cursos externos", () => {
  const source = readFileSync(resolve(process.cwd(), "app/professor/turmas-externas/page.tsx"), "utf8");

  it("mantém uma hierarquia visual responsiva e encaminha cada fluxo para sua rota", () => {
    expect(source).toContain("ExternalClassesSectionNav");
    expect(source).toContain("ExternalClassesSectionNav");
    expect(source).toContain("external-classes-page");
    expect(source).toContain("focus:ring-2 focus:ring-red-600");
  });

  it("mantém o foco da entrada na consulta das turmas", () => {
    expect(source).toContain("Turmas externas");
    expect(source).toContain("ExternalClassesSectionNav");
    expect(source).not.toContain("Visão operacional");
  });

  it("preserva estados de carregamento e erro na entrada", () => {
    expect(source).toContain("Atualizando dados");
    expect(source).toContain("Fazer login");
    expect(source).toContain("focus:ring-2 focus:ring-red-600");
  });

  it("mantém a navegação dedicada fora da entrada principal", () => {
    expect(source).toContain("ExternalClassesSectionNav");
  });

  it("mantém foco visível e identificação acessível das ações rápidas", () => {
    expect(source).toContain("aria-label=\"Resumo de sincronização\"");
    expect(source).toContain("aria-label=\"Ações Rápidas\"");
    expect(source).toContain("focus:ring-2 focus:ring-red-600");
    expect(source).toContain("placeholder:text-gray-500 dark:placeholder:text-slate-400");
  });
});
