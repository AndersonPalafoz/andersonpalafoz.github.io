import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const proxy = readFileSync(resolve(root, "proxy.ts"), "utf8");
const cmsApi = readFileSync(resolve(root, "app/api/admin/cms/route.ts"), "utf8");
const couponsApi = readFileSync(resolve(root, "app/api/admin/coupons/route.ts"), "utf8");

describe("governança das subpáginas administrativas", () => {
  it("usa a capacidade central para proteger os painéis administrativo e docente", () => {
    expect(proxy).toContain("canAccessAdminPortal");
    expect(proxy).toContain("canAccessProfessorPortal");
  });

  it("mantém CMS e operações de cupom restritos ao superadmin", () => {
    expect(cmsApi).toContain("requireSuperAdmin");
    expect(couponsApi).toContain("requireSuperAdminUser");
  });
});
