import { describe, expect, it } from "vitest";
import { calculateStreakDays, getStreakBonus, isApprovedStudentSession } from "./gamification";

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
});
