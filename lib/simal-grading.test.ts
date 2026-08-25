import { describe, expect, it } from "vitest";
import { calculateSimalComposite } from "./simal-grading";

describe("calculateSimalComposite", () => {
  it("soma prova de até 8 e apresentação de até 2 em uma nota final de 10", () => {
    const result = calculateSimalComposite([
      { assessmentTitle: "SIMAL Units 1, 2 & 4", assessmentType: "written", assessmentComponent: "total", score: "7.25", maxScore: "8.0", createdAt: "2026-06-10" },
      { assessmentTitle: "SIMAL Presentation", assessmentType: "presentation", assessmentComponent: "presentation", score: "1.5", maxScore: "2.0", createdAt: "2026-06-15" },
    ]);
    expect(result.isSimal).toBe(true);
    expect(result.proofScore).toBe(7.25);
    expect(result.presentationScore).toBe(1.5);
    expect(result.finalScore).toBe(8.75);
    expect(result.complete).toBe(true);
  });

  it("mantém a situação incompleta quando a apresentação ainda não foi lançada", () => {
    const result = calculateSimalComposite([
      { assessmentTitle: "SIMAL Units 1, 2 & 4", assessmentType: "written", assessmentComponent: "total", score: "8", maxScore: "8", createdAt: "2026-06-10" },
    ]);
    expect(result.proofScore).toBe(8);
    expect(result.presentationScore).toBeNull();
    expect(result.finalScore).toBeNull();
    expect(result.missingPresentation).toBe(true);
    expect(result.complete).toBe(false);
  });

  it("soma componentes da prova quando não existe lançamento total", () => {
    const result = calculateSimalComposite([
      { assessmentTitle: "SIMAL Grammar", assessmentType: "written", assessmentComponent: "grammar", score: "2", maxScore: "2" },
      { assessmentTitle: "SIMAL Reading", assessmentType: "written", assessmentComponent: "reading", score: "1.5", maxScore: "2" },
      { assessmentTitle: "SIMAL Presentation", assessmentType: "presentation", assessmentComponent: "presentation", score: "2", maxScore: "2" },
    ]);
    expect(result.proofScore).toBe(3.5);
    expect(result.finalScore).toBe(5.5);
  });

  it("não altera o cálculo de avaliações não SIMAL", () => {
    const result = calculateSimalComposite([
      { assessmentTitle: "Prova regular", assessmentType: "custom", assessmentComponent: "total", score: "8", maxScore: "10" },
    ]);
    expect(result.isSimal).toBe(false);
    expect(result.finalScore).toBeNull();
  });
});
