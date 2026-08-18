import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

function source(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("contratos de segurança dos módulos administrativos", () => {
  it("mantém paginação, filtros e guard administrativo na API de cupons", () => {
    const route = source("app/api/admin/coupons/route.ts");
    expect(route).toContain("requireAdmin");
    expect(route).toContain("ilike(coupons.code");
    expect(route).toContain("pageSize");
    expect(route).toContain("Math.min(Math.max(pageSizeValue, 1), 50)");
    expect(route).toContain("status de cupom inválido".replace("status", "Status"));
  });

  it("mantém o super-admin e o registro de auditoria em concessões e revogações", () => {
    const grantRoute = source("app/api/admin/manual-access/route.ts");
    const revokeRoute = source("app/api/admin/manual-access/[id]/route.ts");
    expect(grantRoute).toContain("requireSuperAdmin");
    expect(grantRoute).toContain('action: "manual_access_grant"');
    expect(grantRoute).toContain("adminAuditLogs");
    expect(revokeRoute).toContain("requireSuperAdmin");
    expect(revokeRoute).toContain('action: "manual_access_revoke"');
    expect(revokeRoute).toContain("adminAuditLogs");
  });
});
