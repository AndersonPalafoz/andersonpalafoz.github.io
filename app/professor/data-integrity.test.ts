import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const teacherHelpers = readFileSync(new URL("../../lib/teacher.ts", import.meta.url), "utf8");
const tasksPage = readFileSync(new URL("./tarefas/page.tsx", import.meta.url), "utf8");
const speakingPage = readFileSync(new URL("./progresso-aulas/page.tsx", import.meta.url), "utf8");
const speakingRoute = readFileSync(new URL("../api/professor/progress-speaking/route.ts", import.meta.url), "utf8");
const progressPage = readFileSync(new URL("./progresso/page.tsx", import.meta.url), "utf8");
const summaryRoute = readFileSync(new URL("../api/professor/resumo/route.ts", import.meta.url), "utf8");

 describe("Painel do professor: contrato de dados reais", () => {
  it("não contém condições permissivas que expõem dados globais", () => {
    expect(teacherHelpers).not.toContain("|| true");
    expect(progressPage).toContain("visibleCourseIds");
  });

  it("carrega o seletor de cursos por endpoint autenticado do professor", () => {
    expect(tasksPage).toContain('fetch("/api/professor/courses")');
    expect(tasksPage).not.toContain('fetch("/api/courses")');
  });

  it("não usa nota padrão nem avaliação automática de speaking", () => {
    expect(speakingPage).not.toContain("useState<number>(85)");
    expect(speakingRoute).not.toContain("analyzeSpeakingAudio");
    expect(speakingRoute).not.toContain("triggerAIAnalysis");
    expect(speakingRoute).toContain("Informe uma nota do professor");
  });

  it("escopa o resumo de turmas externas ao professor autenticado", () => {
    expect(summaryRoute).toContain("externalClasses.teacherId");
    expect(summaryRoute).toContain("materialCourseId");
  });
});
