import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const middleware = readFileSync(resolve(root, "middleware.ts"), "utf8");
const cmsApi = readFileSync(resolve(root, "app/api/admin/cms/route.ts"), "utf8");
const couponsApi = readFileSync(resolve(root, "app/api/admin/coupons/route.ts"), "utf8");

describe("governança das subpáginas administrativas", () => {
  it("usa a capacidade central para proteger os painéis administrativo e docente", () => {
    expect(middleware).toContain("canAccessAdminPortal");
    expect(middleware).toContain("canAccessProfessorPortal");
  });

  it("mantém CMS e operações de cupom restritos ao superadmin", () => {
    expect(cmsApi).toContain("requireSuperAdmin");
    expect(couponsApi).toContain("email !== SUPER_ADMIN_EMAIL");
  });
});
