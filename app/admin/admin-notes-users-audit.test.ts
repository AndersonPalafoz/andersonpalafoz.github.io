import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const notesPage = readFileSync(new URL("./anotacoes/page.tsx", import.meta.url), "utf8");
const studentsRoute = readFileSync(new URL("../api/admin/notes/students/route.ts", import.meta.url), "utf8");
const exportRoute = readFileSync(new URL("../api/admin/export-users/route.ts", import.meta.url), "utf8");

describe("admin notes and users authorization contracts", () => {
  it("uses the least-privilege student endpoint from the notes page", () => {
    expect(notesPage).toContain('fetch("/api/admin/notes/students")');
    expect(notesPage).not.toContain('fetch("/api/admin/users")');
    expect(studentsRoute).toContain("requireAdmin");
    expect(studentsRoute).toContain('eq(user.role, "user")');
    expect(studentsRoute).toContain("isNull(user.deletedAt)");
  });

  it("keeps the users CSV export restricted to the super-admin policy", () => {
    expect(exportRoute).toContain("requireSuperAdmin");
    expect(exportRoute).toContain("Acesso restrito ao super-admin");
  });
});
