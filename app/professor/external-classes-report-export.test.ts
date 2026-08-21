import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("exportação de relatórios acadêmicos de turmas externas", () => {
  const source = readFileSync(resolve(process.cwd(), "app/professor/turmas-externas/page.tsx"), "utf8");

  it("consolida presença e notas a partir dos registros persistidos da turma", () => {
    expect(source).toContain("getAcademicReportRows");
    expect(source).toContain("JSON.parse(attendance.attendanceData)");
    expect(source).toContain("cls.grades || []");
    expect(source).toContain("averageGrade");
    expect(source).toContain("attendancePercent");
  });

  it("exporta CSV com identificação acadêmica e metadados dos alunos", () => {
    expect(source).toContain("exportAcademicCsv");
    expect(source).toContain("RELATÓRIO ACADÊMICO — NOTAS E PRESENÇAS");
    expect(source).toContain("CPF");
    expect(source).toContain("Universidade");
    expect(source).toContain("Frequência (%)");
    expect(source).toContain("relatorio_academico_");
    expect(source).toContain("text/csv;charset=utf-8");
  });

  it("abre uma prévia imprimível para salvar o relatório em PDF", () => {
    expect(source).toContain("exportAcademicPdf");
    expect(source).toContain("window.open(\"\", \"_blank\"");
    expect(source).toContain("Escolha ‘Salvar como PDF’");
    expect(source).toContain("@page { size: A4 landscape");
    expect(source).toContain("Relatório acadêmico PDF");
  });

  it("oferece as ações de exportação no desktop e no menu de ações rápidas", () => {
    expect(source).toContain("Relatório CSV");
    expect(source).toContain("Relatório PDF");
    expect(source).toContain("Relatório acadêmico CSV");
    expect(source).toContain("Relatório acadêmico PDF");
  });
});
