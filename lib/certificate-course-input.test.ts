import { describe, expect, it } from "vitest";
import { buildCertificateCourseInput } from "./certificate-course-input";

describe("buildCertificateCourseInput", () => {
  it("produces a complete persisted course payload", () => {
    const payload = buildCertificateCourseInput({
      title: " English Mastery B2 ",
      level: "Intermediário (B1)",
      institution: "Curso Externo / Avulso",
      workloadHours: 40,
    });

    expect(payload).toEqual({
      title: "English Mastery B2",
      description: "Curso cadastrado para emissão de certificado.",
      level: "Intermediário (B1)",
      category: "Curso Externo / Avulso",
      modules: 0,
      instructor: "Anderson Palafoz",
      modality: "individual",
      isFree: false,
      price: 0,
      workloadHours: 40,
      maxAbsencePercent: 25,
      courseType: 1,
      syncModality: "none",
    });
  });

  it("uses safe defaults for omitted optional values", () => {
    const payload = buildCertificateCourseInput({ title: "Curso personalizado" });

    expect(payload.level).toBe("Geral");
    expect(payload.category).toBe("Curso Externo / Avulso");
    expect(payload.workloadHours).toBe(40);
    expect(payload.courseType).toBe(1);
    expect(payload.syncModality).toBe("none");
  });
});
