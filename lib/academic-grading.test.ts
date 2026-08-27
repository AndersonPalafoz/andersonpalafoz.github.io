import { describe, expect, it } from "vitest";
import { calculateAcademicOutcome } from "./academic-grading";

describe("academic grading contract", () => {
  it("calcula aprovação padrão com nota decimal", () => {
    const result = calculateAcademicOutcome({
      policy: "standard",
      gradingConfig: { passingAverage: "7,5" },
      grades: [{ score: "7,5" }, { score: 8 }],
    });
    expect(result.average).toBe(7.8);
    expect(result.status).toBe("approved");
  });

  it("mantém SIMAL como prova até 8 mais apresentação até 2", () => {
    const result = calculateAcademicOutcome({
      policy: "simal",
      simalGrades: [
        { assessmentTitle: "Prova escrita", assessmentType: "written", assessmentComponent: "total", score: "7,5", maxScore: "8" },
        { assessmentTitle: "Apresentação", assessmentType: "presentation", assessmentComponent: "presentation", score: "1,5", maxScore: "2" },
      ],
    });
    expect(result.average).toBe(9);
    expect(result.status).toBe("approved");
  });

  it("fica pendente quando o SIMAL não tem todos os componentes", () => {
    const result = calculateAcademicOutcome({
      policy: "simal",
      simalGrades: [{ assessmentType: "written", assessmentComponent: "total", score: 8, maxScore: 8 }],
    });
    expect(result.status).toBe("pending");
    expect(result.simal?.missingPresentation).toBe(true);
  });

  it("prioriza reprovação por excesso de faltas", () => {
    const result = calculateAcademicOutcome({
      policy: "standard",
      gradingConfig: { passingAverage: 6 },
      grades: [{ score: 9 }],
      attendance: { total: 10, absent: 3, maxAbsencePercent: 25 },
    });
    expect(result.status).toBe("failed");
    expect(result.absencePercent).toBe(30);
  });
});
