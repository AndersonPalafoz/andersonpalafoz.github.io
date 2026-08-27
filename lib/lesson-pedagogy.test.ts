import { describe, expect, it } from "vitest";
import {
  getLessonBody,
  getLessonPedagogy,
  hasLessonPedagogy,
  normalizeLessonPedagogy,
  withLessonPedagogy,
} from "./lesson-pedagogy";

describe("lesson pedagogy", () => {
  it("preserva o roteiro da aula ao incluir objetivos e evidências estruturados", () => {
    const content = withLessonPedagogy("Pratique os exemplos em voz alta.", {
      learningObjectives: ["Usar o Simple Present para falar de rotinas"],
      evidenceOfLearning: ["Gravar uma resposta oral com três frases completas"],
    });

    expect(getLessonBody(content)).toBe("Pratique os exemplos em voz alta.");
    expect(getLessonPedagogy(content)).toEqual({
      learningObjectives: ["Usar o Simple Present para falar de rotinas"],
      evidenceOfLearning: ["Gravar uma resposta oral com três frases completas"],
    });
  });

  it("normaliza listas, remove duplicações e limita itens vazios", () => {
    expect(normalizeLessonPedagogy({
      learningObjectives: " Identificar verbos principais \n Identificar verbos principais \n ",
      evidenceOfLearning: ["", "Escrever duas frases contextualizadas"],
    })).toEqual({
      learningObjectives: ["Identificar verbos principais"],
      evidenceOfLearning: ["Escrever duas frases contextualizadas"],
    });
  });

  it("mantém aulas legadas sem metadados pedagógicos legíveis", () => {
    const pedagogy = getLessonPedagogy("Conteúdo antigo da aula.");
    expect(pedagogy).toEqual({ learningObjectives: [], evidenceOfLearning: [] });
    expect(hasLessonPedagogy(pedagogy)).toBe(false);
  });
});
