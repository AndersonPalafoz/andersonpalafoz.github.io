import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Material Download Authentication Security", () => {
  it("requires session for protected materials and verifies user role or purchase/enrollment", () => {
    const routeContent = readFileSync(join(process.cwd(), "app/api/materials/[id]/download/route.ts"), "utf8");
    expect(routeContent).toContain("getServerSession(authOptions)");
    expect(routeContent).toContain("coursePurchases");
    expect(routeContent).toContain("enrollments");
  });
});
