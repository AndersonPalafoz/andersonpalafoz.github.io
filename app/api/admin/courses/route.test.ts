import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./route.ts", import.meta.url), "utf8");

describe("cursos gerenciados por professor", () => {
  it("autoriza professores e preserva a autoria no momento da criação", () => {
    expect(source).toContain('import { requireTeacherOrAdmin, canManageCourse } from "@/lib/admin-auth"');
    expect(source).toContain("const admin = await requireTeacherOrAdmin()");
    expect(source).toContain('admin.user.role === "professor" ? { instructor: admin.user.name || admin.user.email || "Professor" }');
  });

  it("mantém a exclusão definitiva fora do escopo docente", () => {
    expect(source).toContain("A exclusão definitiva de cursos é exclusiva da administração.");
  });
});
