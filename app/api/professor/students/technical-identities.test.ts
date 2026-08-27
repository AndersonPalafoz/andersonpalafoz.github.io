import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const routeSource = fs.readFileSync(
  path.join(process.cwd(), "app/api/professor/students/route.ts"),
  "utf8"
);

describe("API de alunos docentes", () => {
  it("filtra identidades técnicas antes de devolver solicitações pendentes", () => {
    expect(routeSource).toContain('import { isTechnicalLearnerIdentity } from "@/lib/technical-identities"');
    expect(routeSource).toContain("students: pendingStudents.filter(student => !isTechnicalLearnerIdentity(student))");
  });
});
