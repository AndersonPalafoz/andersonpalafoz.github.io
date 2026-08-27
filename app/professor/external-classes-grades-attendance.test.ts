import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("External Classes Grades and Attendance Feature Contract", () => {
  it("implements saveBatchGrades and saveGrade actions in external-classes API route with validation and notifications", () => {
    const routePath = path.join(process.cwd(), "app/api/professor/external-classes/route.ts");
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, "utf8");
    expect(content).toContain('action === "saveBatchGrades"');
    expect(content).toContain('action === "saveGrade"');
    expect(content).toContain("externalClassGrades");
    expect(content).toContain("notifications");
  });

  it("normalizes decimal score input before validation and persistence", () => {
    const routePath = path.join(process.cwd(), "app/api/professor/external-classes/route.ts");
    const content = fs.readFileSync(routePath, "utf8");
    expect(content).toContain("normalizeGradeInput");
    expect(content).toContain("const normalizedScore = normalizeGradeInput(score)");
    expect(content).toContain("const normalizedBatchMaxScore = normalizeGradeInput(maxScore || \"10.0\")");
  });

  it("provides calculated averages and private teacher notes in the management UI", () => {
    const pagePath = path.join(process.cwd(), "app/professor/turmas-externas/page.tsx");
    const content = fs.readFileSync(pagePath, "utf8");
    expect(content).toContain("Resumo calculado por aluno");
    expect(content).toContain("Anotações do professor");
    expect(content).toContain("Visível apenas no gerenciamento da turma pelo professor.");
    expect(content).toContain("averageGrade.toFixed(1)");
  });

  it("implements saveAttendance action in external-classes API route with date and student status map", () => {
    const routePath = path.join(process.cwd(), "app/api/professor/external-classes/route.ts");
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, "utf8");
    expect(content).toContain('action === "saveAttendance"');
    expect(content).toContain("externalClassAttendance");
    expect(content).toContain("attendanceData");
  });

  it("renders attendance and grades management UI in the teacher turmas-externas page", () => {
    const pagePath = path.join(process.cwd(), "app/professor/turmas-externas/page.tsx");
    expect(fs.existsSync(pagePath)).toBe(true);
    const content = fs.readFileSync(pagePath, "utf8");
    expect(content).toContain("saveGrade");
    expect(content).toContain("saveAttendance");
    expect(content).toContain("Chamada");
    expect(content).toContain("Notas e Avaliações");
  });
});
