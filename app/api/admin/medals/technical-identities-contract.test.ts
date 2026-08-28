import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("admin medals current-student boundary", () => {
  it("uses the shared technical-identity filter for current students and grants", () => {
    const route = readFileSync(path.join(process.cwd(), "app/api/admin/medals/route.ts"), "utf8");

    expect(route).toContain('from "@/lib/technical-identities"');
    expect(route).toContain(".filter((student) => !isTechnicalLearnerIdentity(student))");
    expect(route).toContain("isTechnicalLearnerIdentity({ name: grant.userName, email: grant.userEmail })");
    expect(route).toContain("isTechnicalLearnerIdentity(targetUser)");
  });
});
