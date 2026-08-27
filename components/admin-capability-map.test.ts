import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("AdminCapabilityMap", () => {
  it("expõe as operações docentes e o escopo ampliado do administrador", () => {
    const source = readFileSync(resolve(process.cwd(), "components/admin-capability-map.tsx"), "utf8");
    expect(source).toContain("Turmas externas");
    expect(source).toContain("Tarefas e prazos");
    expect(source).toContain("Aulas e speaking");
    expect(source).toContain("Poderes adicionais do administrador");
    expect(source).toContain("Escopo global");
  });

  it("inclui os controles exclusivos quando a visão é de superadministração", () => {
    const source = readFileSync(resolve(process.cwd(), "components/admin-capability-map.tsx"), "utf8");
    expect(source).toContain("superadminOperations");
    expect(source).toContain("Controles exclusivos de superadmin");
    expect(source).toContain("Stripe e cupons");
    expect(source).toContain("isSuperadmin");
  });
});
