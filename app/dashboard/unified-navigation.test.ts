import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const shell = readFileSync(resolve(root, "app/dashboard/dashboard-shell.tsx"), "utf8");
const dashboardLayout = readFileSync(resolve(root, "app/dashboard/layout.tsx"), "utf8");
const professorLayout = readFileSync(resolve(root, "app/professor/layout.tsx"), "utf8");
const adminLayout = readFileSync(resolve(root, "app/admin/layout.tsx"), "utf8");

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
});
