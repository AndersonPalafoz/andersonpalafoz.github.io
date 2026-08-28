import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const routeSource = fs.readFileSync(
  path.join(process.cwd(), "app/api/professor/students/route.ts"),
  "utf8"
);
const pageSource = fs.readFileSync(
  path.join(process.cwd(), "app/professor/alunos/page.tsx"),
  "utf8"
);

describe("Contexto de alunos externos", () => {
  it("lista a matrícula acadêmica dentro do contexto offerId/classId", () => {
    expect(routeSource).toContain("resolveAndAuthorizeAcademicContext");
    expect(routeSource).toContain('request.nextUrl.searchParams.get("offerId")');
    expect(routeSource).toContain('request.nextUrl.searchParams.get("classId")');
    expect(routeSource).toContain("courseOfferStudents.findMany");
  });

  it("usa courseOfferStudentId como identidade mutável e mantém userId opcional", () => {
    expect(routeSource).toContain("body.courseOfferStudentId ?? body.studentId");
    expect(routeSource).toContain("courseOfferStudents.id");
    expect(pageSource).toContain("courseOfferStudentId: number | null");
    expect(pageSource).toContain("Sem conta no site");
    expect(pageSource).not.toContain("if (!student.userId)");
  });

  it("preserva as solicitações legadas somente quando não há contexto acadêmico", () => {
    expect(routeSource).toContain('eq(users.approvalStatus, "pending")');
    expect(routeSource).toContain('body.action === "approve" || body.action === "reject"');
    expect(pageSource).toContain('student.approvalStatus === "pending"');
  });
});
