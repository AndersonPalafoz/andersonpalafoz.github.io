import { describe, expect, it } from "vitest";
import { calculateInternalClassProgress, shouldCelebrateProgress } from "./internal-class-progress";

describe("internal class progress", () => {
  it("returns no evidence when there are no lessons or activities", () => {
    expect(calculateInternalClassProgress({ totalLessons: 0, completedLessons: 0, totalActivities: 0, completedActivities: 0 })).toMatchObject({ percentage: 0, hasEvidence: false });
  });

  it("combines completed lessons and activities", () => {
    expect(calculateInternalClassProgress({ totalLessons: 3, completedLessons: 1, totalActivities: 1, completedActivities: 1 })).toMatchObject({ percentage: 50, hasEvidence: true });
  });

  it("caps a completed path at one hundred percent", () => {
    expect(calculateInternalClassProgress({ totalLessons: 2, completedLessons: 2, totalActivities: 2, completedActivities: 2 }).percentage).toBe(100);
  });

  it("celebrates only a real increase after initial data exists", () => {
    expect(shouldCelebrateProgress(null, 25, true)).toBe(false);
    expect(shouldCelebrateProgress(25, 25, true)).toBe(false);
    expect(shouldCelebrateProgress(50, 25, true)).toBe(false);
    expect(shouldCelebrateProgress(25, 50, true)).toBe(true);
    expect(shouldCelebrateProgress(25, 50, false)).toBe(false);
  });
});
