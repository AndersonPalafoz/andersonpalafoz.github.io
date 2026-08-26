import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const shell = readFileSync(resolve(root, "app/dashboard/dashboard-shell.tsx"), "utf8");
const dashboardLayout = readFileSync(resolve(root, "app/dashboard/layout.tsx"), "utf8");
const professorLayout = readFileSync(resolve(root, "app/professor/layout.tsx"), "utf8");
const adminLayout = readFileSync(resolve(root, "app/admin/layout.tsx"), "utf8");
const siteFrame = readFileSync(resolve(root, "components/site-frame.tsx"), "utf8");
const adminPage = readFileSync(resolve(root, "app/admin/page.tsx"), "utf8");
const professorPage = readFileSync(resolve(root, "app/professor/page.tsx"), "utf8");
const styles = readFileSync(resolve(root, "app/globals.css"), "utf8");

describe("navegação lateral unificada", () => {
  it("organiza menu lateral por aprendizagem, docência, administração e superadministração", () => {
    expect(shell).toContain('label: "Minha aprendizagem"');
    expect(shell).toContain('label: "Docência"');
    expect(shell).toContain('label: "Administração"');
    expect(shell).toContain('label: "Superadministração"');
    expect(shell).toContain("visibleRole === \"superadmin\"");
    expect(shell).toContain("canAdminister");
  });

  it("reutiliza a mesma moldura lateral em dashboard, professor e admin", () => {
    expect(dashboardLayout).toContain("DashboardShell");
    expect(professorLayout).toContain("DashboardShell");
    expect(adminLayout).toContain("DashboardShell");
    expect(dashboardLayout).toContain("RolePreviewProvider");
  });

  it("mantém a visualização por papel apenas como controle de interface", () => {
    expect(shell).toContain("RolePreviewToolbar");
    expect(shell).toContain('actualRole === "superadmin"');
  });

  it("remove o cabeçalho público das áreas protegidas para ampliar a área útil do painel", () => {
    expect(siteFrame).toContain('pathname?.startsWith("/dashboard")');
    expect(siteFrame).toContain('pathname?.startsWith("/professor")');
    expect(siteFrame).toContain('pathname?.startsWith("/admin")');
    expect(siteFrame).toContain("min-h-[100dvh]");
  });

  it("usa cabeçalhos com ações agrupadas e uma quebra segura para telas estreitas", () => {
    expect(adminPage).toContain("Ações frequentes");
    expect(professorPage).toContain("Ações frequentes");
    expect(adminPage).toContain("xl:grid-cols");
    expect(professorPage).toContain("xl:grid-cols");
    expect(styles).toContain("@media (max-width: 420px)");
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr)");
  });
});
