import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const adminLayout = readFileSync(resolve(root, "app/admin/layout.tsx"), "utf8");
const professorLayout = readFileSync(resolve(root, "app/professor/layout.tsx"), "utf8");
const cms = readFileSync(resolve(root, "app/admin/cms/page.tsx"), "utf8");
const coupons = readFileSync(resolve(root, "app/admin/cupons/page.tsx"), "utf8");
const couponDelete = readFileSync(resolve(root, "app/api/admin/coupons/[id]/route.ts"), "utf8");
const teacherProgress = readFileSync(resolve(root, "app/professor/progresso/page.tsx"), "utf8");

describe("contexto e acesso dos painéis", () => {
  it("aplica contexto de papel e guardas nas áreas administrativa e docente", () => {
    expect(adminLayout).toContain("PanelRoleContext");
    expect(professorLayout).toContain("canAccessProfessorPortal");
    expect(professorLayout).toContain("PanelRoleContext");
  });

  it("mantém CMS e Stripe como operações exclusivas do superadmin", () => {
    expect(cms).toContain("canUseCms");
    expect(cms).toContain("Controle exclusivo de superadmin");
    expect(coupons).toContain("isSuperadmin");
    expect(couponDelete).toContain("email !== SUPER_ADMIN_EMAIL");
  });

  it("reutiliza o escopo central de cursos no progresso docente", () => {
    expect(teacherProgress).toContain("canAccessProfessorPortal");
    expect(teacherProgress).toContain("getTeacherCourses(email)");
    expect(teacherProgress).not.toContain('course.instructor === "Anderson Palafoz"');
  });
});
