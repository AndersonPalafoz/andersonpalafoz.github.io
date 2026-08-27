import { describe, expect, it } from "vitest";
import {
  buildOfferMigrationPlan,
  chooseOfferName,
  inferGradingPolicy,
  normalizeLegacyText,
  remapAttendanceData,
  studentDisplayName,
} from "./course-offer-migration";

describe("migração de cursos externos para ofertas", () => {
  it("normaliza texto legado e cria nome determinístico de oferta", () => {
    expect(normalizeLegacyText("  SIMAL  ")).toBe("simal");
    expect(chooseOfferName({ className: "Matutino", academicTerm: "2026.1" })).toBe("Matutino — 2026.1");
  });

  it("classifica a política SIMAL sem depender de capitalização", () => {
    expect(inferGradingPolicy("SímAl")) .toBe("simal");
    expect(inferGradingPolicy("UFBA")).toBe("standard");
  });

  it("gera plano idempotente quando a oferta já existe", () => {
    const plan = buildOfferMigrationPlan({
      legacyClass: { id: 5, institution: "SIMAL", courseName: "Inglês", className: "Matutino", academicTerm: "2026.1", teacherId: 9 },
      existingOfferId: 44,
      studentCount: 3,
      attendanceCount: 2,
    });
    expect(plan.decision).toBe("already-migrated");
    expect(plan.reason).toContain("44");
  });

  it("remapeia as chaves da chamada para os novos IDs contextuais", () => {
    const remapped = remapAttendanceData(JSON.stringify({ "10": "present", "11": "absent", "99": "late" }), new Map([[10, 101], [11, 102]]));
    expect(JSON.parse(remapped)).toEqual({ "101": "present", "102": "absent" });
  });

  it("usa nome social quando disponível", () => {
    expect(studentDisplayName({ name: "Nome Civil", socialName: "Nome Social" })).toBe("Nome Social");
    expect(studentDisplayName({ name: "Nome Civil", socialName: null })).toBe("Nome Civil");
  });
});
