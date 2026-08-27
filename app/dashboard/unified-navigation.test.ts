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
const profilePage = readFileSync(resolve(root, "app/dashboard/perfil/page.tsx"), "utf8");
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

  it("protege o hero administrativo contra palavras longas e encurta os rótulos da navegação mobile", () => {
    expect(adminPage).toContain("admin-dashboard-hero");
    expect(adminPage).toContain("[overflow-wrap:anywhere]");
    expect(adminPage).toContain('action.mobile ? "flex" : "hidden sm:flex"');
    expect(shell).toContain('mobileLabel: "Admin"');
    expect(shell).toContain("item.mobileLabel || item.label");
    expect(styles).toContain(".admin-dashboard-hero h1");
  });

  it("prioriza os controles exclusivos de superadmin na navegação mobile sem expô-los a outros papéis", () => {
    expect(shell).toContain('mobileLabel: "CMS"');
    expect(shell).toContain('mobileLabel: "Cupons"');
    expect(shell).toContain('mobileLabel: "Auditoria"');
    expect(shell).toContain("superadminNavItems[0]");
    expect(shell).toContain("Superadministração");
  });

  it("mantém as medalhas acessíveis por atalho do aluno, menu completo administrativo e perfil", () => {
    expect(shell).toContain('href: "/dashboard/perfil#medals-title", label: "Medalhas"');
    expect(shell).toContain('href: "/admin/medalhas", label: "Medalhas"');
    expect(shell).toContain("mobileOverflowItems");
    expect(shell).toContain("studentNavItems[8]");
    expect(profilePage).toContain('href="#medals-title"');
    expect(profilePage).toContain("Ver minhas medalhas e emblemas");
  });

  it("expõe o menu completo na barra inferior sem duplicar atalhos nem ampliar permissões", () => {
    expect(shell).toContain("const mobileOverflowItems = allNavItems.filter");
    expect(shell).toContain('aria-label="Abrir todas as funções disponíveis"');
    expect(shell).toContain('aria-label="Atalhos e menu principal mobile"');
    expect(shell).toContain("setSidebarOpen(true)");
    expect(shell).toContain("teacherNavItems[4]");
    expect(shell).toContain("superadminNavItems[2]");
  });
});
