import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  filterAcademicReportRows,
  hasFailedByAttendance,
  hasFailedByGrade,
  summarizeAcademicReportRows,
} from "@/lib/external-academic-report";

describe("critérios de reprovação dos relatórios acadêmicos", () => {
  const rows = [
    { id: "nota", averageGrade: 5.9, attendancePercent: 90 },
    { id: "falta", averageGrade: 8.5, attendancePercent: 74.9 },
    { id: "ambos", averageGrade: 5, attendancePercent: 70 },
    { id: "aprovado", averageGrade: 7, attendancePercent: 80 },
    { id: "sem-dados", averageGrade: null, attendancePercent: null },
  ];

  it("classifica corretamente reprovação por nota e frequência", () => {
    expect(hasFailedByGrade(rows[0])).toBe(true);
    expect(hasFailedByGrade(rows[1])).toBe(false);
    expect(hasFailedByAttendance(rows[1])).toBe(true);
    expect(hasFailedByAttendance(rows[0])).toBe(false);
    expect(hasFailedByGrade(rows[4])).toBe(false);
    expect(hasFailedByAttendance(rows[4])).toBe(false);
  });

  it("aplica os quatro recortes disponíveis sem misturar os critérios", () => {
    expect(filterAcademicReportRows(rows, "all").map((row) => row.id)).toEqual(["nota", "falta", "ambos", "aprovado", "sem-dados"]);
    expect(filterAcademicReportRows(rows, "grade").map((row) => row.id)).toEqual(["nota", "ambos"]);
    expect(filterAcademicReportRows(rows, "attendance").map((row) => row.id)).toEqual(["falta", "ambos"]);
    expect(filterAcademicReportRows(rows, "any").map((row) => row.id)).toEqual(["nota", "falta", "ambos"]);
  });

  it("calcula proporções reais de aprovados, reprovados e dados insuficientes", () => {
    expect(summarizeAcademicReportRows(rows)).toMatchObject({
      total: 5,
      approved: 1,
      failed: 3,
      insufficientData: 1,
      approvedPercent: 20,
      failedPercent: 60,
      insufficientDataPercent: 20,
      failedByGrade: 2,
      failedByAttendance: 2,
    });
    expect(summarizeAcademicReportRows([])).toMatchObject({
      total: 0,
      approved: 0,
      failed: 0,
      insufficientData: 0,
      approvedPercent: 0,
      failedPercent: 0,
      insufficientDataPercent: 0,
    });
  });
});

describe("contrato da exportação de relatórios acadêmicos de turmas externas", () => {
  const source = readFileSync(resolve(process.cwd(), "app/professor/turmas-externas/page.tsx"), "utf8");
  const utilitySource = readFileSync(resolve(process.cwd(), "lib/external-academic-report.ts"), "utf8");

  it("consolida presença e notas a partir dos registros persistidos da turma", () => {
    expect(source).toContain("getAcademicReportRows");
    expect(source).toContain("JSON.parse(attendance.attendanceData)");
    expect(source).toContain("cls.grades || []");
    expect(source).toContain("averageGrade");
    expect(source).toContain("attendancePercent");
  });

  it("define critérios explícitos para reprovação por nota e frequência", () => {
    expect(utilitySource).toContain('export type AcademicReportFilter = "all" | "grade" | "attendance" | "any"');
    expect(utilitySource).toContain("export const REPORT_MIN_GRADE = 6");
    expect(utilitySource).toContain("export const REPORT_MIN_ATTENDANCE = 75");
    expect(source).toContain("failedByGrade");
    expect(source).toContain("failedByAttendance");
    expect(source).toContain("filterAcademicReportRows");
  });

  it("exporta CSV com identificação acadêmica, metadados e filtro aplicado", () => {
    expect(source).toContain("exportAcademicCsv");
    expect(source).toContain("RELATÓRIO ACADÊMICO — NOTAS E PRESENÇAS");
    expect(source).toContain("CPF");
    expect(source).toContain("Universidade");
    expect(source).toContain("Frequência (%)");
    expect(source).toContain("relatorio_academico_");
    expect(source).toContain("_${filter}.csv");
    expect(source).toContain("text/csv;charset=utf-8");
    expect(source).toContain("Filtro aplicado");
    expect(source).toContain("Alunos incluídos");
  });

  it("abre uma prévia imprimível em PDF com o filtro e os limites acadêmicos", () => {
    expect(source).toContain("exportAcademicPdf");
    expect(source).toContain("window.open(\"\", \"_blank\"");
    expect(source).toContain("@page { size: A4 landscape");
    expect(source).toContain("Relatório acadêmico PDF");
    expect(source).toContain("academicReportFilterLabel(filter)");
    expect(source).toContain("Critérios de reprovação");
    expect(source).toContain("summarizeAcademicReportRows(reportRows)");
    expect(source).toContain("Resumo do desempenho acadêmico");
    expect(source).toContain("bar-approved");
    expect(source).toContain("bar-failed");
    expect(source).toContain("bar-insufficient");
    expect(source).toContain("background: #16a34a");
    expect(source).toContain("background: #dc2626");
    expect(source).toContain("background: #9ca3af");
    expect(source).toContain(".approved-label { color: #166534; }");
    expect(source).toContain(".failed-label { color: #991b1b; }");
    expect(source).toContain(".insufficient-label { color: #4b5563; }");
    expect(source).toContain("Dados insuficientes");
    expect(source).toContain("Média final");
    expect(source).toContain("Nota SIMAL");
    expect(source).toContain("Situação");
    expect(source).toContain("academicStatusLabel");
    expect(source).toContain("Aprovado");
  });

  it("oferece o filtro e as ações de exportação no desktop e no menu de ações rápidas", () => {
    expect(source).toContain("aria-label=\"Filtrar exportação por reprovação\"");
    expect(source).toContain("Reprovados por nota (&lt; 6,0)");
    expect(source).toContain("Reprovados por falta (&lt; 75%)");
    expect(source).toContain("Relatório CSV");
    expect(source).toContain("Relatório PDF");
    expect(source).toContain("Relatório acadêmico CSV");
    expect(source).toContain("Relatório acadêmico PDF");
  });
});
