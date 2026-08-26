import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const quickAccess = readFileSync(resolve(root, "components/panel-quick-access.tsx"), "utf8");
const adminLayout = readFileSync(resolve(root, "app/admin/layout.tsx"), "utf8");
const professorLayout = readFileSync(resolve(root, "app/professor/layout.tsx"), "utf8");
const adminMobileNav = readFileSync(resolve(root, "components/admin-mobile-nav.tsx"), "utf8");

describe("atalhos diretos entre áreas", () => {
  it("filtra atalhos administrativos, docentes e exclusivos de superadmin pela capacidade efetiva", () => {
    expect(quickAccess).toContain("canAccessAdminPortal");
    expect(quickAccess).toContain("canAccessProfessorPortal");
    expect(quickAccess).toContain("isSuperadmin");
    expect(quickAccess).toContain('href: "/admin/cms"');
    expect(quickAccess).toContain('href: "/professor"');
  });

  it("disponibiliza a troca de área nos layouts e na navegação mobile administrativa", () => {
    expect(adminLayout).toContain("PanelQuickAccess");
    expect(professorLayout).toContain("PanelQuickAccess");
    expect(adminMobileNav).toContain('href: "/professor"');
    expect(adminMobileNav).toContain('label: "Docência"');
  });
});
