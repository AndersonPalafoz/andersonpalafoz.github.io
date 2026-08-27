import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("course offers API contracts", () => {
  const collection = read("app/api/course-offers/route.ts");
  const item = read("app/api/course-offers/[id]/route.ts");
  const teachers = read("app/api/course-offers/[id]/teachers/route.ts");
  const students = read("app/api/course-offers/[id]/students/route.ts");
  const auth = read("lib/admin-auth.ts");

  it("protege a coleção e não permite professor criar em nome de outro", () => {
    expect(collection).toContain("requireTeacherOrAdmin");
    expect(collection).toContain("ownerTeacherId");
    expect(collection).toContain("Professor não pode criar oferta em nome de outro usuário.");
  });

  it("protege item, usa soft delete e restringe restauração", () => {
    expect(item).toContain("canReadCourseOffer");
    expect(item).toContain("canManageCourseOffer");
    expect(item).toContain("softDeleteCourseOffer");
    expect(item).toContain("restoreCourseOffer");
    expect(item).toContain("Somente administradores podem restaurar ofertas.");
  });

  it("restringe atribuição docente a administradores e valida professor", () => {
    expect(teachers).toContain("Somente administradores podem atribuir professores.");
    expect(teachers).toContain('teacher.role !== "professor"');
    expect(teachers).toContain("onConflictDoNothing");
  });

  it("exige identidade contextual e valida vínculo de aluno", () => {
    expect(students).toContain("Informe userId ou externalStudentId.");
    expect(students).toContain("externalStudentId");
    expect(students).toContain("canManageCourseOffer");
    expect(students).toContain("Matrícula não encontrada.");
  });

  it("centraliza autorização de oferta no helper compartilhado", () => {
    expect(auth).toContain("canManageCourseOffer");
    expect(auth).toContain("courseOfferTeacherAssignments");
    expect(auth).toContain("canReadCourseOffer");
  });
});
