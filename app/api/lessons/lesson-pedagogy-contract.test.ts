import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const adminLessonsRoute = readFileSync(join(root, "app/api/admin/lessons/route.ts"), "utf8");
const lessonDetailRoute = readFileSync(join(root, "app/api/lessons/[id]/detail/route.ts"), "utf8");
const lessonPage = readFileSync(join(root, "app/cursos/[id]/aulas/[lessonId]/page.tsx"), "utf8");
const teacherRoute = readFileSync(join(root, "app/api/professor/progress-speaking/route.ts"), "utf8");
const teacherPage = readFileSync(join(root, "app/professor/progresso-aulas/page.tsx"), "utf8");

describe("contratos do ciclo pedagógico de aulas", () => {
  it("serializa objetivos e evidências no CRUD sem exigir migração de lessons", () => {
    expect(adminLessonsRoute).toContain("withLessonPedagogy(content, { learningObjectives, evidenceOfLearning })");
    expect(adminLessonsRoute).toContain("isPedagogyUpdate");
    expect(adminLessonsRoute).toContain("A aula não pertence ao curso informado.");
  });

  it("entrega a proposta pedagógica no detalhe e a mostra apenas quando preenchida", () => {
    expect(lessonDetailRoute).toContain("pedagogy: getLessonPedagogy(lesson.content)");
    expect(lessonPage).toContain("Ao concluir esta aula, você poderá");
    expect(lessonPage).toContain("Como demonstrar sua aprendizagem");
  });

  it("permite solicitar uma nova tentativa com orientação e mantém o histórico", () => {
    expect(teacherRoute).toContain("requestRevision");
    expect(teacherRoute).toContain('status: requestRevision ? "in_progress" as const : "completed" as const');
    expect(teacherRoute).toContain("Explique em pelo menos 12 caracteres");
    expect(lessonPage).toContain("Nova tentativa orientada");
    expect(lessonPage).toContain("Sua tentativa anterior e a devolutiva continuam preservadas no histórico.");
  });

  it("conecta a fila docente à resposta autorizada e à ação segura na mesma página", () => {
    expect(teacherRoute).toContain("buildPedagogicalInterventions");
    expect(teacherPage).toContain("Fila de intervenções pedagógicas");
    expect(teacherPage).toContain('href={`#activity-progress-${item.activityProgressId}`}');
    expect(teacherPage).toContain("Solicitar nova tentativa");
  });
});
