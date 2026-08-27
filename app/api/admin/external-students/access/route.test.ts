import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./route.ts", import.meta.url), "utf8");

describe("acesso discente de turmas externas", () => {
  it("permite provisão apenas a professor ou administrador responsável pela turma", () => {
    expect(source).toContain('import { canManageExternalClass, requireTeacherOrAdmin } from "@/lib/admin-auth"');
    expect(source).toContain("const session = await requireTeacherOrAdmin()");
    expect(source).toContain("await canManageExternalClass(session, classId)");
    expect(source).toContain("Professores só podem gerenciar o acesso de alunos em suas próprias turmas.");
  });
});
