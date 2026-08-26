import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const route = readFileSync(resolve(root, "app/api/professor/external-classes/route.ts"), "utf8");
const page = readFileSync(resolve(root, "app/professor/turmas-externas/page.tsx"), "utf8");

describe("atribuição de professores em turmas externas", () => {
  it("mantém o vínculo persistente e a autorização por turma própria ou atribuída", () => {
    expect(route).toContain("externalClassTeacherAssignments");
    expect(route).toContain("const canManageClass");
    expect(route).toContain("delegatedClassIds.has(classId)");
    expect(route).not.toContain("teacherId !== teacher?.id");
  });

  it("restringe a alteração de atribuições a administradores", () => {
    expect(route).toContain('action === "setTeacherAssignments"');
    expect(route).toContain("Somente administradores podem atribuir professores");
  });

  it("oferece controle visual de atribuições apenas para administração", () => {
    expect(page).toContain("canAccessAdminPortal");
    expect(page).toContain("Professores atribuídos");
    expect(page).toContain("Salvar atribuições");
  });
});
