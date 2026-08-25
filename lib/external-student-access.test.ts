import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

describe("external student access", () => {
  it("persists first-login password rotation and links external students", () => {
    const schema = read("drizzle/schema.ts");
    expect(schema).toContain('mustChangePassword: boolean("must_change_password")');
    expect(schema).toContain('userId: integer("user_id")');
    expect(read("app/api/auth/change-password/route.ts")).toContain("mustChangePassword: false");
  });

  it("protects provisioning and sends through the existing email helper", () => {
    const route = read("app/api/admin/external-students/access/route.ts");
    expect(route).toContain('session?.user?.role === "admin"');
    expect(route).toContain("sendEmailNotification");
    expect(route).toContain("temporaryPassword");
  });

  it("exposes the external area, profile and unit progress to students", () => {
    expect(read("app/dashboard/aluno-externo/page.tsx")).toContain("Média mínima atingida");
    expect(read("app/dashboard/aluno-externo/page.tsx")).toContain("Editar meu perfil");
    expect(read("app/dashboard/aluno-externo/perfil/page.tsx")).toContain("/api/user/profile");
    expect(read("app/dashboard/dashboard-shell.tsx")).toContain('href: "/dashboard/aluno-externo"');
  });

  it("restricts password recovery to completed external accounts", () => {
    const recovery = read("app/api/auth/forgot-password/route.ts");
    expect(recovery).toContain('user?.loginMethod === "external-password"');
    expect(recovery).toContain('user.mustChangePassword === false');
    expect(recovery).toContain('resetUser?.loginMethod === "external-password"');
  });

  it("supports individual administrative resend and live password requirements", () => {
    expect(read("app/api/admin/external-students/access/route.ts")).toContain('body.action === "resend"');
    const adminPage = read("app/professor/turmas-externas/page.tsx");
    expect(adminPage).toContain("studentIds: [studentId]");
    expect(adminPage).toContain("Último acesso:");
    expect(read("app/admin/page.tsx")).toContain('href="/professor/turmas-externas?tab=students"');
    const firstAccess = read("app/primeiro-acesso/page.tsx");
    expect(firstAccess).toContain("requirements");
    expect(firstAccess).toContain("passwordIsStrong");
    expect(firstAccess).toContain("Pelo menos 12 caracteres");
    const resetPage = read("app/redefinir-senha/page.tsx");
    expect(resetPage).toContain("passwordIsStrong");
    expect(resetPage).toContain("Um símbolo");
  });
});
