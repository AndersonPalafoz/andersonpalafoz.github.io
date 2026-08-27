import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("contrato visual da página de cursos externos", () => {
  const source = readFileSync(resolve(process.cwd(), "app/professor/turmas-externas/page.tsx"), "utf8");

  it("mantém uma hierarquia visual responsiva para o cabeçalho e o conteúdo", () => {
    expect(source).toContain("max-w-[1500px]");
    expect(source).toContain("text-xl leading-tight sm:text-3xl");
    expect(source).toContain("grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]");
    expect(source).toContain("p-4 sm:p-6 lg:px-8 lg:py-8");
  });

  it("preserva superfícies, estados e cards com suporte ao modo escuro", () => {
    expect(source).toContain("bg-white/95 dark:bg-slate-900");
    expect(source).toContain("dark:border-slate-800");
    expect(source).toContain("Atualizado às");
    expect(source).toContain("Atualizando dados");
    expect(source).toContain("hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]");
  });

  it("expõe uma visão operacional com indicadores acionáveis", () => {
    expect(source).toContain("Visão operacional");
    expect(source).toContain("Turmas ativas");
    expect(source).toContain("Chamadas pendentes");
    expect(source).toContain("Avaliações pendentes");
    expect(source).toContain("Nova turma");
    expect(source).toContain("Prévia da importação");
    expect(source).toContain("Deseja confirmar?");
  });

  it("mantém foco visível e identificação acessível das ações rápidas", () => {
    expect(source).toContain("aria-label=\"Resumo de sincronização\"");
    expect(source).toContain("aria-label=\"Ações Rápidas\"");
    expect(source).toContain("focus:ring-2 focus:ring-red-600");
    expect(source).toContain("placeholder:text-gray-500 dark:placeholder:text-slate-400");
  });
});
