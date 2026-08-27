import { describe, expect, it } from "vitest";

import { isLearnerVisibleCourse, isTechnicalCourse } from "@/lib/course-visibility";

describe("visibilidade de cursos", () => {
  it("reconhece os marcadores técnicos de certificados sem depender de caixa", () => {
    expect(isTechnicalCourse({ title: "TESTE DOCX IsF – Anderson Palafoz" })).toBe(true);
    expect(isTechnicalCourse({ title: "Curso de Validação DOCX" })).toBe(true);
    expect(isTechnicalCourse({ title: "Módulo de teste para certificado" })).toBe(true);
    expect(isTechnicalCourse({ title: "Inglês", description: "Curso de validação" })).toBe(true);
  });

  it("mantém cursos pedagógicos visíveis para alunos e professores", () => {
    expect(isLearnerVisibleCourse({ title: "English Mastery B2", description: "Curso regular" })).toBe(true);
    expect(isLearnerVisibleCourse({ title: "Preparação para exame", description: "Avaliação de nivelamento" })).toBe(true);
    expect(isLearnerVisibleCourse({ title: "Inglês Básico A1", description: "Curso regular para iniciantes." })).toBe(true);
  });
});
