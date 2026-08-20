import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("External course authorization", () => {
  it("guards Type 4 course details before loading modules or progress", () => {
    const source = readFileSync(join(process.cwd(), "app/cursos/[id]/page.tsx"), "utf8");

    expect(source).toContain("const isExternalCourse = course.courseType === 4");
    expect(source).toContain("coursePurchases");
    expect(source).toContain("enrollments");
    expect(source).toContain("Curso externo com acesso restrito");
    expect(source).toContain("Entrar para continuar");
  });

  it("protects the lesson detail API before returning materials and activities", () => {
    const source = readFileSync(join(process.cwd(), "app/api/lessons/[id]/detail/route.ts"), "utf8");

    expect(source).toContain("const isExternalCourse = course?.courseType === 4");
    expect(source).toContain('return NextResponse.json({ error: "Este curso externo exige autorização." }, { status: 403 })');
    expect(source).toContain("schemaCoursePurchases");
    expect(source).toContain("schemaEnrollments");
  });
});
