import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routeSource = readFileSync(
  new URL("../api/professor/progress-speaking/route.ts", import.meta.url),
  "utf8"
);

describe("progresso docente sem identidades técnicas", () => {
  it("reconhece placeholders de certificados e cadastros externos técnicos", () => {
    expect(routeSource).toContain('import { isTechnicalLearnerIdentity } from "@/lib/technical-identities"');
    expect(routeSource).toContain("!isTechnicalLearnerIdentity(student)");
  });

  it("remove contas de teste antes de calcular alunos e indicadores acompanhados", () => {
    expect(routeSource).toContain("assignedStudents = assignedStudents.filter(");
    expect(routeSource).toContain("!isTechnicalLearnerIdentity(student)");
    expect(routeSource).toContain("const studentIds = assignedStudents.map(s => s.id)");
  });
});
