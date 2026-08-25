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

  it("keeps administrative and teaching scopes separate", () => {
    const source = readFileSync(resolve(process.cwd(), "lib/admin-auth.ts"), "utf8");
    const adminBlock = source.slice(source.indexOf("export async function requireAdmin"), source.indexOf("export async function requireSuperAdmin"));
    const teachingBlock = source.slice(source.indexOf("export async function requireTeacherOrAdmin"), source.indexOf("/**"));
    expect(adminBlock).not.toContain('role === "professor"');
    expect(teachingBlock).toContain('role === "professor"');
    expect(source).toContain("canManageCourse");
    expect(source).toContain("canManageExternalClass");
  });
});
