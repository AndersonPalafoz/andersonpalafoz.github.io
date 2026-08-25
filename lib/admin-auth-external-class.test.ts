import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("external class authorization contract", () => {
  it("uses the external class primary key for ownership checks", () => {
    const source = readFileSync(resolve(process.cwd(), "lib/admin-auth.ts"), "utf8");
    expect(source).toContain("where: eq(externalClasses.id, classId)");
    expect(source).toContain("return extClass.teacherId === dbUser.id");
    expect(source).toContain("session.user.role === \"admin\"");
  });
});
