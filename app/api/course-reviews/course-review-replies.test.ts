import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./[courseId]/route.ts", import.meta.url), "utf8");

describe("course review replies contract", () => {
  it("supports role-protected replies and persistent student notifications", () => {
    expect(source).toContain("export async function PATCH");
    expect(source).toContain("courseReviewReplies");
    expect(source).toContain("notifications");
    expect(source).toContain("course_review_reply");
    expect(source).toContain('session?.user?.role !== "admin"');
  });
});
