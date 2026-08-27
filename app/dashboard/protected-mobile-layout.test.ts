import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("largura móvel das áreas protegidas", () => {
  it("remove somente o padding horizontal duplicado de páginas que reutilizam o shell", () => {
    const globalStyles = read("app/globals.css");

    expect(globalStyles).toContain(".dashboard-content > div > .site-shell");
    expect(globalStyles).toContain(".dashboard-content > div > .site-shell > .page-container");
    expect(globalStyles).toContain("padding-inline: 0;");
    expect(globalStyles).toContain("max-width: 100%;");
  });

  it("mantém administração e docência dentro do shell protegido compartilhado", () => {
    const adminLayout = read("app/admin/layout.tsx");
    const professorLayout = read("app/professor/layout.tsx");
    const dashboardLayout = read("app/dashboard/layout.tsx");

    expect(adminLayout).toContain("<DashboardShell");
    expect(professorLayout).toContain("<DashboardShell");
    expect(dashboardLayout).toContain("<DashboardShell");
  });
});
