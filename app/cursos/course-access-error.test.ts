import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Course and lesson access flow", () => {
  it("keeps lesson content public while gating personal progress by user", () => {
    const routePath = path.join(process.cwd(), "app/api/lessons/[id]/detail/route.ts");
    const source = fs.readFileSync(routePath, "utf8");

    expect(source).toContain("const user = session?.user?.email");
    expect(source).toContain("const progressRecord = user");
    expect(source).toContain("const activityProgress = user");
    expect(source).not.toContain('if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });');
  });

  it("loads lesson details from the client endpoint and tolerates unauthenticated auxiliary requests", () => {
    const pagePath = path.join(process.cwd(), "app/cursos/[id]/aulas/[lessonId]/page.tsx");
    const source = fs.readFileSync(pagePath, "utf8");

    expect(source).toContain("/api/lessons/${lessonId}/detail");
    expect(source).toContain("if (noteRes.ok)");
    expect(source).toContain("if (attRes.ok)");
    expect(source).not.toContain("Atividades Práticas (Listening & Speaking com IA)");
    expect(source).not.toContain("Resultado da IA");
  });

  it("keeps the course detail route linked from the catalog", () => {
    const catalogPath = path.join(process.cwd(), "components/course-catalog.tsx");
    const source = fs.readFileSync(catalogPath, "utf8");

    expect(source).toContain("href={`/cursos/${course.id}`}");
  });
});
