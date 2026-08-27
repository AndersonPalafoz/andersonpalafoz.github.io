import { describe, expect, it } from "vitest";
import { calculateCourseGrade, normalizeGradeInput, parseGradeNumber, parseUnitPassingAverages } from "./course-grading";

describe("course grading configuration", () => {
  it("calculates a whole-course average with a configurable threshold", () => {
    const result = calculateCourseGrade({ hasUnits: true, unitCount: 2, gradingScope: "course", passingAverage: 6 }, [
      { score: 5 }, { score: 7 },
    ]);
    expect(result.average).toBe(6);
    expect(result.passed).toBe(true);
    expect(result.scope).toBe("course");
  });

  it("requires every unit to pass when the scope is unit", () => {
    const result = calculateCourseGrade({ hasUnits: true, unitCount: 2, gradingScope: "unit", passingAverage: 5, unitPassingAverages: JSON.stringify({ "1": 5, "2": 7 }) }, [
      { score: 8, unit: 1 }, { score: 6, unit: 2 },
    ]);
    expect(result.units.map(unit => unit.passingAverage)).toEqual([5, 7]);
    expect(result.passed).toBe(false);
  });

  it("parses invalid overrides safely", () => {
    expect(parseUnitPassingAverages("invalid")).toEqual({});
  });

  it("normalizes decimal commas without rejecting zero", () => {
    expect(parseGradeNumber("0")).toBe(0);
    expect(parseGradeNumber("7,5")).toBe(7.5);
    expect(parseGradeNumber("não é nota")).toBeNull();
    expect(parseGradeNumber("   ")).toBeNull();
  });

  it("serializes decimal input consistently for persistence", () => {
    expect(normalizeGradeInput("0")).toBe("0");
    expect(normalizeGradeInput("7,50")).toBe("7.5");
    expect(normalizeGradeInput("1.25")).toBe("1.25");
    expect(normalizeGradeInput(",75")).toBe("0.75");
    expect(normalizeGradeInput(".5")).toBe("0.5");
    expect(normalizeGradeInput(2.75)).toBe("2.75");
    expect(normalizeGradeInput("abc")).toBeNull();
  });
});
