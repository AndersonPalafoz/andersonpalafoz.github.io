import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "app/professor/turmas-externas/page.tsx"), "utf8");
const errorBoundary = readFileSync(join(process.cwd(), "app/professor/turmas-externas/error.tsx"), "utf8");
const loadingBoundary = readFileSync(join(process.cwd(), "app/professor/turmas-externas/loading.tsx"), "utf8");

describe("feedback visual de turmas externas", () => {
  it("classifica erros de sessão, permissão, recurso ausente e servidor", () => {
    expect(source).toContain('status === 401');
    expect(source).toContain('status === 403');
    expect(source).toContain('status === 404');
    expect(source).toContain('status >= 500');
    expect(source).toContain("Sessão necessária");
    expect(source).toContain("Acesso não autorizado");
    expect(source).toContain("Falha temporária no servidor");
  });

  it("oferece feedback persistente, retry e link de login", () => {
    expect(source).toContain('role="alert"');
    expect(source).toContain("Tentar novamente");
    expect(source).toContain('href="/login"');
    expect(source).toContain("setOperationFeedback");
    expect(source).toContain("aria-live=\"polite\"");
  });

  it("diferencia banco vazio de filtro sem resultados e permite limpar filtros", () => {
    expect(source).toContain("Nenhuma turma externa cadastrada");
    expect(source).toContain("Nenhuma turma corresponde aos filtros");
    expect(source).toContain("Limpar filtros");
    expect(source).toContain("selectedYearFilter, selectedSemesterFilter");
  });

  it("possui fallback de erro de rota e carregamento com dados reais", () => {
    expect(errorBoundary).toContain("Não foi possível exibir este painel");
    expect(errorBoundary).toContain("Tentar novamente");
    expect(loadingBoundary).toContain("Carregando turmas e dados acadêmicos reais");
    expect(loadingBoundary).toContain('aria-busy="true"');
  });
});
