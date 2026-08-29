import { describe, expect, it } from "vitest";
import { calculateStreakDays, computeLevelForPoints, getStreakBonus, isApprovedStudentSession } from "./gamification";

function utcDay(day: string) {
  return new Date(`${day}T12:00:00.000Z`);
}

describe("gamification rules", () => {
  it("calculates only the consecutive activity streak ending today", () => {
    const today = utcDay("2026-08-19");
    expect(calculateStreakDays([utcDay("2026-08-17"), utcDay("2026-08-18"), today], today)).toBe(3);
    expect(calculateStreakDays([utcDay("2026-08-18")], today)).toBe(0);
  });

  it("keeps streak bonuses explicit and deterministic", () => {
    expect(getStreakBonus(7)).toBe(50);
    expect(getStreakBonus(14)).toBe(100);
    expect(getStreakBonus(8)).toBe(0);
  });

  it("accepts only approved sessions, with admin as an explicit exception", () => {
    expect(isApprovedStudentSession(null)).toBe(false);
    expect(isApprovedStudentSession({ user: { role: "user", approvalStatus: "pending" } })).toBe(false);
    expect(isApprovedStudentSession({ user: { role: "user", approvalStatus: "approved" } })).toBe(true);
    expect(isApprovedStudentSession({ user: { role: "admin", approvalStatus: "pending" } })).toBe(true);
  });

  it("computes a CEFR-style level tier from accumulated points", () => {
    expect(computeLevelForPoints(0)).toBe("Explorer (A1)");
    expect(computeLevelForPoints(99)).toBe("Explorer (A1)");
    expect(computeLevelForPoints(100)).toBe("Beginner (A2)");
    expect(computeLevelForPoints(300)).toBe("Intermediate (B1)");
    expect(computeLevelForPoints(700)).toBe("Upper Intermediate (B2)");
    expect(computeLevelForPoints(1500)).toBe("Advanced (C1)");
    expect(computeLevelForPoints(3000)).toBe("Master (C2)");
    expect(computeLevelForPoints(999999)).toBe("Master (C2)");
  });
});
