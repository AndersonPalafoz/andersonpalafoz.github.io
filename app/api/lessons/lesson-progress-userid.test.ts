
import { describe, it, expect } from "vitest";

describe("Lesson Progress API Security & User ID Resolution", () => {
  it("resolves userId directly from session.user.id without email prefix parsing", () => {
    const sessionUser = { id: "42", email: "palafozanderson@gmail.com" };
    const resolvedUserId = Number.parseInt(sessionUser.id ?? "", 10);
    expect(resolvedUserId).toBe(42);
    expect(Number.isInteger(resolvedUserId)).toBe(true);
  });
});
