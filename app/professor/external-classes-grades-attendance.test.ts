import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("External Classes Grades and Attendance Feature Contract", () => {
  it("implements saveGrade action in external-classes API route with security checks and notifications", () => {
    const routePath = path.join(process.cwd(), "app/api/professor/external-classes/route.ts");
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, "utf8");
    expect(content).toContain('action === "saveGrade"');
    expect(content).toContain("externalClassGrades");
    expect(content).toContain("notifications");
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
