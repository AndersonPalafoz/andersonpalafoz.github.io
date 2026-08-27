import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./route.ts", import.meta.url), "utf8");

describe("auditoria de superadministração", () => {
  it("protege a consulta de logs com a autorização central de superadmin", () => {
    expect(source).toContain('import { requireSuperAdmin } from "@/lib/admin-auth"');
    expect(source).toContain("const session = await requireSuperAdmin()");
    expect(source).toContain("Acesso restrito ao superadministrador");
  });

  it("preserva filtros validados e paginação limitada para consultas seguras", () => {
    expect(source).toContain("const MAX_LIMIT = 100");
    expect(source).toContain("EVENT_TYPES.includes");
    expect(source).toContain("Math.min(Math.max");
  });
});
