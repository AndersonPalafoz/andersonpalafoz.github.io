import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routeSource = readFileSync(
  new URL("../api/professor/progress-speaking/route.ts", import.meta.url),
  "utf8"
);

describe("progresso docente sem identidades técnicas", () => {
  it("reconhece placeholders de certificados e cadastros externos técnicos", () => {
    expect(routeSource).toContain("function isTechnicalCertificateAccount");
    expect(routeSource).toContain('email.endsWith("@external.placeholder")');
    expect(routeSource).toContain('email.startsWith("nao-cadastrado-")');
    expect(routeSource).toContain('student.loginMethod === "manual_external"');
  });

  it("remove contas de teste antes de calcular alunos e indicadores acompanhados", () => {
    expect(routeSource).toContain('name.includes("teste docx")');
    expect(routeSource).toContain("assignedStudents = assignedStudents.filter(");
    expect(routeSource).toContain("!isTechnicalCertificateAccount(student)");
    expect(routeSource).toContain("const studentIds = assignedStudents.map(s => s.id)");
  });
});
