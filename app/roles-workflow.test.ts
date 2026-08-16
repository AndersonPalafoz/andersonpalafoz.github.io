import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const requestRoleRoute = readFileSync(new URL("./api/user/request-role/route.ts", import.meta.url), "utf8");
const professorStudentsRoute = readFileSync(new URL("./api/professor/students/route.ts", import.meta.url), "utf8");
const registrationPage = readFileSync(new URL("./cadastro/page.tsx", import.meta.url), "utf8");
const professorPage = readFileSync(new URL("./professor/alunos/page.tsx", import.meta.url), "utf8");

describe("role request and teacher moderation contract", () => {
  it("keeps role requests explicit and pending", () => {
    expect(requestRoleRoute).toContain("requestedRole");
    expect(requestRoleRoute).toContain('approvalStatus: "pending"');
    expect(requestRoleRoute).toContain('new Set(["student", "professor"])');
  });

  it("limits student moderation to approved teachers or admins", () => {
    expect(professorStudentsRoute).toContain('role === "professor" || role === "admin"');
    expect(professorStudentsRoute).toContain('approvalStatus === "approved"');
    expect(professorStudentsRoute).toContain('requestedRole, "student"');
    expect(professorStudentsRoute).toContain('action === "reject"');
  });

  it("exposes the request workflow in the UI", () => {
    expect(registrationPage).toContain("Solicite seu papel na plataforma");
    expect(registrationPage).toContain('value="professor"');
    expect(professorPage).toContain("Aprovar aluno");
    expect(professorPage).toContain("Recusar");
  });
});
