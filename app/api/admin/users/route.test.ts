import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./route.ts", import.meta.url), "utf8");
const createSource = readFileSync(new URL("./create/route.ts", import.meta.url), "utf8");

describe("gestão administrativa de pessoas", () => {
  it("permite operação administrativa com limites explícitos para contas administrativas", () => {
    expect(source).toContain('import { requireAdmin } from "@/lib/admin-auth"');
    expect(source).toContain('user.role !== "admin"');
    expect(source).toContain("Administradores só podem gerenciar alunos e professores.");
    expect(source).toContain("Administradores não podem excluir outras contas administrativas.");
  });

  it("reserva promoção e exclusão definitiva para a governança global", () => {
    expect(source).toContain("Somente o superadministrador pode promover uma conta a administrador.");
    expect(source).toContain("A exclusão definitiva é exclusiva do superadministrador.");
    expect(createSource).toContain("Somente o superadministrador pode criar novas contas administrativas.");
  });
});
