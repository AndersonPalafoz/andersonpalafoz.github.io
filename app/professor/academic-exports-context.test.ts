import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("exportações acadêmicas contextualizadas", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "app/professor/turmas-externas/page.tsx"), "utf8");

  it("inclui offerId nos metadados e nomes dos arquivos", () => {
    expect(source).toContain("Oferta / contexto");
    expect(source).toContain("cls.offerId ??");
    expect(source).toContain("relatorio_academico_${cls.offerId");
  });

  it("inclui courseOfferStudentId no CSV e Excel", () => {
    expect(source).toContain("Matrícula acadêmica");
    expect(source).toContain("student.courseOfferStudentId ??");
  });

  it("mantém alunos externos sem conta nos relatórios", () => {
    expect(source).toContain("student.email || \"\"");
    expect(source).toContain("student.courseOfferStudentId ?? \"\"");
  });

  it("inclui o contexto acadêmico no PDF", () => {
    expect(source).toContain("<b>Oferta / contexto</b>");
    expect(source).toContain("<th>Matrícula acadêmica</th>");
  });
});
