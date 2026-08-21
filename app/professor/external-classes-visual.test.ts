import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("contrato visual da página de cursos externos", () => {
  const source = readFileSync(resolve(process.cwd(), "app/professor/turmas-externas/page.tsx"), "utf8");

  it("mantém uma hierarquia visual responsiva para o cabeçalho e o conteúdo", () => {
    expect(source).toContain("max-w-[1500px]");
    expect(source).toContain("text-2xl sm:text-3xl");
    expect(source).toContain("grid-cols-1 lg:grid-cols-3");
    expect(source).toContain("p-4 sm:p-6 lg:p-10");
  });

  it("preserva superfícies, estados e cards com suporte ao modo escuro", () => {
    expect(source).toContain("bg-white/95 dark:bg-slate-900");
    expect(source).toContain("dark:border-slate-800");
    expect(source).toContain("Dados sincronizados");
    expect(source).toContain("hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]");
  });

  it("mantém foco visível e identificação acessível das ações rápidas", () => {
    expect(source).toContain("aria-label=\"Resumo de sincronização\"");
    expect(source).toContain("aria-label=\"Ações Rápidas\"");
    expect(source).toContain("focus:ring-2 focus:ring-red-600");
    expect(source).toContain("placeholder:text-gray-500 dark:placeholder:text-slate-400");
  });
});
