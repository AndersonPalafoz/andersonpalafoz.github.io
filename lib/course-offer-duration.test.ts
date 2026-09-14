import { describe, expect, it } from "vitest";
import { formatCourseOfferDuration, validateCourseOfferDuration } from "./course-offer-duration";

describe("course offer duration", () => {
  it.each([
    ["monthly", "mensal"],
    ["bimonthly", "bimestral"],
    ["quarterly", "trimestral"],
    ["semester", "semestral"],
    ["annual", "anual"],
  ])("aceita o período %s", (period, label) => {
    const result = validateCourseOfferDuration({ durationType: "calendar_period", durationUnit: period, durationValue: 1, workloadHours: 40 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(formatCourseOfferDuration(result)).toBe(label);
  });

  it("aceita carga horária de uma hora", () => {
    const result = validateCourseOfferDuration({ durationType: "workload", workloadHours: 1, durationValue: 1 });
    expect(result).toMatchObject({ ok: true, durationValue: 1, durationUnit: "hours", workloadHours: 1 });
  });

  it.each([0, -1, 1.5, "1.5"])("rejeita carga horária inválida: %s", (hours) => {
    expect(validateCourseOfferDuration({ durationType: "workload", workloadHours: hours, durationValue: hours }).ok).toBe(false);
  });

  it("mantém compatibilidade com semestre legado", () => {
    expect(validateCourseOfferDuration({ durationType: "semester", durationValue: 1, durationUnit: "semester", workloadHours: 40 })).toMatchObject({ ok: true });
  });
});
