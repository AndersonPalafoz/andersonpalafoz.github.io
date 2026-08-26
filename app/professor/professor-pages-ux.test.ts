import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function source(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("painéis administrativos e docentes — contratos de UX", () => {
  it("mantém recuperação e limpeza na área administrativa de anotações", () => {
    const page = source("app/admin/anotacoes/page.tsx");
    expect(page).toContain("Não foi possível consultar os alunos agora");
    expect(page).toContain("Limpar seleção");
    expect(page).toContain("ConfirmDialog");
  });

  it("mantém filtro de alunos e indicadores de progresso", () => {
    const page = source("app/professor/progresso-aulas/page.tsx");
    expect(page).toContain("Filtrar aluno...");
    expect(page).toContain("Aulas concluídas");
    expect(page).toContain("Feedbacks pendentes");
  });

  it("mantém busca, erro recuperável e exportações na área de tarefas", () => {
    const page = source("app/professor/tarefas/page.tsx");
    expect(page).toContain("Não foi possível carregar as tarefas");
    expect(page).toContain("Tentar novamente");
    expect(page).toContain("Exportar CSV");
    expect(page).toContain("Exportar PDF");
  });
});

