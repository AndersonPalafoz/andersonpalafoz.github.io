import { describe, expect, it } from "vitest";

import { isLearnerVisibleCourse, isTechnicalCourse } from "./course-visibility";

describe("visibilidade de cursos", () => {
  it("reconhece artefatos técnicos de certificado sem depender de caixa", () => {
    expect(isTechnicalCourse({ title: "TESTE DOCX", description: null })).toBe(true);
    expect(isTechnicalCourse({ title: "Inglês", description: "Curso de validação" })).toBe(true);
  });

  it("mantém cursos pedagógicos visíveis para a experiência do aluno", () => {
    const course = { title: "Inglês Básico A1", description: "Curso regular para iniciantes." };

    expect(isTechnicalCourse(course)).toBe(false);
    expect(isLearnerVisibleCourse(course)).toBe(true);
  });
});
