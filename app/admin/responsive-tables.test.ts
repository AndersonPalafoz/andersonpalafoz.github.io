import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("tabelas administrativas em smartphones", () => {
  it("mantém relatórios completos em cartões móveis e em tabela a partir do desktop", () => {
    const page = read("app/admin/relatorios/page.tsx");

    expect(page).toContain('space-y-3 md:hidden');
    expect(page).toContain('hidden overflow-x-auto md:block');
    expect(page).toContain('Nenhum aluno encontrado para os filtros atuais.');
    expect(page).toContain('Nenhum professor encontrado para os filtros atuais.');
    expect(page).toContain('Nenhum curso encontrado para os filtros atuais.');
    expect(page).toContain('grid grid-cols-3 gap-2 text-center text-xs');
  });

  it("preserva cartões de certificados e oferece ações em lote seguras no mobile", () => {
    const certificates = read("components/certificate-standard-manager.tsx");

    expect(certificates).toContain('grid gap-3 md:hidden');
    expect(certificates).toContain('hidden overflow-x-auto md:block');
    expect(certificates).toContain('sticky bottom-3 z-20');
    expect(certificates).toContain('Selecionar página');
    expect(certificates).toContain('Limpar seleção');
    expect(certificates).toContain('/api/user/certificates/batch-download');
    expect(certificates).toContain('role="dialog"');
    expect(certificates).toContain('aria-labelledby="bulk-delete-title"');
  });
});
