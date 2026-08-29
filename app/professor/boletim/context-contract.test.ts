import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("boletim contextual por oferta", () => {
  const routeSource = fs.readFileSync(path.join(process.cwd(), "app/api/professor/external-student-report/route.ts"), "utf8");
  const pageSource = fs.readFileSync(path.join(process.cwd(), "app/professor/boletim/[studentId]/page.tsx"), "utf8");

  it("resolve offerId and authorizes the academic context", () => {
    expect(routeSource).toContain("resolveAndAuthorizeAcademicContext");
    expect(routeSource).toContain('searchParams.get("offerId")');
    expect(routeSource).toContain('searchParams.get("courseOfferStudentId")');
    expect(routeSource).toContain('"read"');
  });

  it("uses courseOfferStudentId for contextual grades and attendance", () => {
    expect(routeSource).toContain("courseOfferStudents");
    expect(routeSource).toContain("courseOfferAttendance");
    expect(routeSource).toContain("eq(externalClassGrades.courseOfferStudentId, offerStudent.id)");
    expect(routeSource).toContain("parsed[String(offerStudent.id)]");
  });

  it("keeps legacy studentId fallback and does not require userId", () => {
    expect(routeSource).toContain("externalStudents.id, Number(studentId)");
    expect(routeSource).toContain("courseOfferStudentId: null");
    expect(pageSource).toContain("const courseOfferStudentId = searchParams.get");
    expect(pageSource).toContain("Matrícula acadêmica:");
  });
});
