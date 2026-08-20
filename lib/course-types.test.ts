import { describe, expect, it } from "vitest";
import { getCourseTypeDefinition, getSyncModalityLabel, normalizeCourseType, validateCourseTypeFields } from "@/lib/course-types";

describe("course types", () => {
  it("normalizes invalid course types to EAD fechado", () => {
    expect(normalizeCourseType(0)).toBe(1);
    expect(normalizeCourseType(6)).toBe(1);
    expect(normalizeCourseType("2")).toBe(2);
  });

  it("exposes the official definition for the five types", () => {
    expect(getCourseTypeDefinition(1).shortLabel).toBe("EAD Fechado");
    expect(getCourseTypeDefinition(2).supportsSync).toBe(true);
    expect(getCourseTypeDefinition(4).shortLabel).toBe("Externo");
    expect(getCourseTypeDefinition(5).shortLabel).toBe("Presencial");
  });

  it("rejects invalid external URLs", () => {
    expect(validateCourseTypeFields({ courseType: 1, externalRedirectUrl: "drive.google.com/course" })).toContain("http");
    expect(validateCourseTypeFields({ courseType: 1, externalRedirectUrl: "https://classroom.google.com/course" })).toBeNull();
  });

  it("prevents synchronous meetings for closed EAD courses", () => {
    expect(validateCourseTypeFields({ courseType: 1, syncModality: "online_group" })).toContain("EAD fechados");
    expect(validateCourseTypeFields({ courseType: 2, syncModality: "online_group" })).toBeNull();
  });

  it("returns human-readable labels for sync modalities", () => {
    expect(getSyncModalityLabel("online_individual")).toBe("Encontros online individuais");
    expect(getSyncModalityLabel("presencial")).toBe("Encontros presenciais");
    expect(getSyncModalityLabel("none")).toBe("Sem encontros síncronos");
  });
});
