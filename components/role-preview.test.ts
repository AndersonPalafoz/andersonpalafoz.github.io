import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const preview = readFileSync(resolve(root, "components/role-preview.tsx"), "utf8");
const quickAccess = readFileSync(resolve(root, "components/panel-quick-access.tsx"), "utf8");
const adminDashboard = readFileSync(resolve(root, "app/admin/page.tsx"), "utf8");
const externalClasses = readFileSync(resolve(root, "app/professor/turmas-externas/page.tsx"), "utf8");
const cms = readFileSync(resolve(root, "app/admin/cms/page.tsx"), "utf8");
const coupons = readFileSync(resolve(root, "app/admin/cupons/page.tsx"), "utf8");

describe("visualização segura e feedback operacional", () => {
  it("mantém a visualização por papel apenas no cliente e deixa explícito que a sessão real não muda", () => {
    expect(preview).toContain("localStorage");
    expect(preview).toContain("permissões reais permanecem inalteradas");
    expect(preview).toContain('value="admin"');
    expect(preview).toContain('value="professor"');
    expect(quickAccess).toContain("visibleRole");
    expect(adminDashboard).toContain('previewRole === "professor"');
  });

  it("fornece estados persistentes para salvar atribuições de professores", () => {
    expect(externalClasses).toContain("assignmentFeedback");
    expect(externalClasses).toContain("Alterações pendentes");
    expect(externalClasses).toContain("Atribuições salvas com sucesso");
    expect(externalClasses).toContain('role={assignmentState?.type === "error" ? "alert" : "status"}');
  });

  it("explica fluxos operacionais nas ferramentas exclusivas de superadmin", () => {
    expect(cms).toContain("Fluxo recomendado para publicação");
    expect(coupons).toContain("Fluxo seguro de cupons");
    expect(coupons).toContain("Configurar");
    expect(coupons).toContain("Acompanhar");
  });
});
